import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { loginLimiter } from '../middleware/rateLimit';
import { authMiddleware } from '../middleware/auth';
import { auditLog } from '../services/audit';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { badge_number, pin, agency_slug } = req.body;

  if (!badge_number || !pin) {
    res.status(400).json({ error: 'Badge number and PIN required' });
    return;
  }

  const slug = agency_slug || 'default_agency';

  try {
    const agency = await db('public.agencies').where({ slug, active: true }).first();
    if (!agency) {
      res.status(401).json({ error: 'Agency not found' });
      return;
    }

    await db.raw('SET search_path = ??', [slug]);

    const user = await db('users').where({ badge_number, active: true }).first();
    if (!user) {
      res.status(401).json({ error: 'Invalid badge number or PIN' });
      return;
    }

    if (user.failed_attempts >= 5) {
      res.status(423).json({ error: 'Account locked. Contact your administrator.' });
      return;
    }

    const valid = await bcrypt.compare(String(pin), user.pin_hash);
    if (!valid) {
      await db('users').where({ id: user.id }).increment('failed_attempts', 1);
      res.status(401).json({ error: 'Invalid badge number or PIN' });
      return;
    }

    await db('users').where({ id: user.id }).update({
      failed_attempts: 0,
      last_login: db.fn.now(),
    });

    const payload = {
      sub: user.id,
      agency_id: agency.id,
      agency_slug: slug,
      role: user.role,
      badge_number: user.badge_number,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.APP_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    let defaultLocation = null;
    if (user.default_location) {
      defaultLocation = await db('locations').where({ id: user.default_location }).first();
    }

    await auditLog(slug, user.id, 'LOGIN', 'auth', user.id, req.ip || '');

    res.json({
      token,
      user: {
        id: user.id,
        badge_number: user.badge_number,
        full_name: user.full_name,
        rank: user.rank,
        role: user.role,
      },
      default_location: defaultLocation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  } finally {
    await db.raw('SET search_path = public');
  }
});

authRouter.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  res.clearCookie('refresh_token');
  res.json({ success: true });
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const newToken = jwt.sign(
      {
        sub: payload.sub,
        agency_id: payload.agency_id,
        agency_slug: payload.agency_slug,
        role: payload.role,
        badge_number: payload.badge_number,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    res.json({ token: newToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const slug = req.user!.agency_slug;
  try {
    await db.raw('SET search_path = ??', [slug]);
    const user = await db('users').where({ id: req.user!.sub }).first();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      id: user.id,
      badge_number: user.badge_number,
      full_name: user.full_name,
      rank: user.rank,
      role: user.role,
      default_location: user.default_location,
    });
  } finally {
    await db.raw('SET search_path = public');
  }
});

authRouter.put('/me', authMiddleware, async (req: Request, res: Response) => {
  const slug = req.user!.agency_slug;
  const { current_location_id } = req.body;
  try {
    await db.raw('SET search_path = ??', [slug]);
    await db('users').where({ id: req.user!.sub }).update({ default_location: current_location_id });
    res.json({ success: true });
  } finally {
    await db.raw('SET search_path = public');
  }
});
