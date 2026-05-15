import { api } from './client';
import type { Case, Report, ReportType, EvidenceItem, EvidenceFile, CustodyEntry } from '../types';

export const authApi = {
  login: (badge_number: string, pin: string, agency_slug = 'default_agency') =>
    api.post('/auth/login', { badge_number, pin, agency_slug }).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateMe: (data: object) => api.put('/auth/me', data),
};

export const locationsApi = {
  list: () => api.get('/admin/locations').then((r) => r.data),
};

export const casesApi = {
  list: (params?: object) => api.get('/cases', { params }).then((r) => r.data),
  create: (data: Partial<Case>) => api.post('/cases', data).then((r) => r.data),
  get: (id: string) => api.get(`/cases/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<Case>) => api.put(`/cases/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/cases/${id}`),
  reports: (id: string) => api.get(`/cases/${id}/reports`).then((r) => r.data),
};

export const reportsApi = {
  create: (case_id: string, report_type: ReportType) =>
    api.post('/reports', { case_id, report_type }).then((r) => r.data),
  get: (id: string) => api.get(`/reports/${id}`).then((r) => r.data),
  saveData: (id: string, fields: Record<string, unknown>) =>
    api.put(`/reports/${id}/data`, { fields }).then((r) => r.data),
  submit: (id: string) => api.post(`/reports/${id}/submit`).then((r) => r.data),
  approve: (id: string, notes?: string) => api.post(`/reports/${id}/approve`, { notes }).then((r) => r.data),
  reject: (id: string, notes: string) => api.post(`/reports/${id}/reject`, { notes }).then((r) => r.data),
  pdf: (id: string) => api.get(`/reports/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),
};

export const evidenceApi = {
  list: (reportId: string) => api.get(`/reports/${reportId}/evidence`).then((r) => r.data as EvidenceItem[]),
  create: (reportId: string, data: Partial<EvidenceItem>) =>
    api.post(`/reports/${reportId}/evidence`, data).then((r) => r.data),
  update: (id: string, data: Partial<EvidenceItem>) => api.put(`/evidence/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/evidence/${id}`),
  custody: (id: string) => api.get(`/evidence/${id}/custody`).then((r) => r.data as CustodyEntry[]),
  addCustody: (id: string, data: Partial<CustodyEntry>) =>
    api.post(`/evidence/${id}/custody`, data).then((r) => r.data),
};

export const filesApi = {
  list: (reportId: string) => api.get(`/reports/${reportId}/files`).then((r) => r.data as EvidenceFile[]),
  upload: (reportId: string, file: File, onProgress?: (pct: number) => void) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/reports/${reportId}/files`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / (e.total || 1)) * 100)),
    }).then((r) => r.data as EvidenceFile);
  },
  delete: (id: string) => api.delete(`/files/${id}`),
  download: (id: string) => api.get(`/files/${id}/download`).then((r) => r.data as { url: string }),
};

export const queueApi = {
  list: (params?: object) => api.get('/queue', { params }).then((r) => r.data as Report[]),
  stats: (params?: object) => api.get('/queue/stats', { params }).then((r) => r.data),
};

export const adminApi = {
  users: () => api.get('/admin/users').then((r) => r.data),
  createUser: (data: object) => api.post('/admin/users', data).then((r) => r.data),
  updateUser: (id: string, data: object) => api.put(`/admin/users/${id}`, data).then((r) => r.data),
  unlockUser: (id: string) => api.post(`/admin/users/${id}/unlock`),
  stats: () => api.get('/admin/stats').then((r) => r.data),
};
