import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

interface WsClient {
  ws: WebSocket;
  userId: string;
  agencySlug: string;
  locationId?: string;
  role: string;
}

const clients: Set<WsClient> = new Set();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `ws://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) { ws.close(4001, 'No token'); return; }

    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    const client: WsClient = {
      ws,
      userId: payload.sub,
      agencySlug: payload.agency_slug,
      role: payload.role,
    };

    clients.add(client);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(String(data));
        if (msg.type === 'set_location') {
          client.locationId = msg.location_id;
        }
      } catch {}
    });

    ws.on('close', () => clients.delete(client));
    ws.on('error', () => clients.delete(client));

    ws.send(JSON.stringify({ type: 'connected', userId: payload.sub }));
  });
}

export async function broadcastQueueUpdate(agencySlug: string, locationId: string, report: any) {
  const message = JSON.stringify({ type: 'queue_update', report });

  for (const client of clients) {
    if (
      client.agencySlug === agencySlug &&
      (client.role === 'supervisor' || client.role === 'admin') &&
      client.ws.readyState === WebSocket.OPEN &&
      (!client.locationId || client.locationId === locationId)
    ) {
      client.ws.send(message);
    }
  }
}
