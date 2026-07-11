import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Card, Comment, DashboardSummary, LoginResponse, User, Project, ProjectMember } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = (window as any).__env?.apiUrl || 'http://localhost:8080/api';
  private readonly apiRoot = this.baseUrl.replace(/\/api\/?$/, '');

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  me() {
    return this.http.get(`${this.baseUrl}/me`);
  }

  listUsers() {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  createUser(payload: { name: string; email: string; password: string; role: 'admin' | 'member' }) {
    return this.http.post<User>(`${this.baseUrl}/users`, payload);
  }

  updateUser(id: number, payload: { name?: string; email?: string; password?: string; role?: 'admin' | 'member' }) {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, payload);
  }

  toggleUserActive(id: number) {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/toggle`, {});
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  changeMyPassword(payload: { currentPassword: string; newPassword: string }) {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/users/me/password`, payload);
  }

  resetUserPasswordToEmail(id: number) {
    return this.http.post<{ message: string; defaultPassword: string }>(`${this.baseUrl}/users/${id}/reset-password`, {});
  }

  // Projects
  listProjects() {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`);
  }

  getProject(id: number) {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
  }

  createProject(payload: { title: string; description: string; memberIds?: number[] }) {
    return this.http.post<Project>(`${this.baseUrl}/projects`, payload);
  }

  updateProject(id: number, payload: { title: string; description: string }) {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, payload);
  }

  deleteProject(id: number) {
    return this.http.delete(`${this.baseUrl}/projects/${id}`);
  }

  deactivateProject(id: number) {
    return this.http.patch<{ success: boolean }>(`${this.baseUrl}/projects/${id}/deactivate`, {});
  }

  addProjectMember(projectId: number, userId: number) {
    return this.http.post<ProjectMember>(`${this.baseUrl}/projects/${projectId}/members`, { "userId": +userId });
  }

  removeProjectMember(projectId: number, memberId: number) {
    return this.http.delete(`${this.baseUrl}/projects/${projectId}/members/${memberId}`);
  }

  listCards(projectId: number, from: string, to: string, assigneeId?: number | string) {
    let params = new HttpParams().set('projectId', projectId).set('from', from).set('to', to);
    if (assigneeId) {
      params = params.set('assigneeId', assigneeId.toString());
    }
    return this.http.get<Card[]>(`${this.baseUrl}/cards`, { params });
  }

  createCard(payload: { projectId: number; title: string; description: string; assigneeId?: number; status?: string }) {
    return this.http.post<Card>(`${this.baseUrl}/cards`, payload);
  }

  getCard(id: number) {
    return this.http.get<Card>(`${this.baseUrl}/cards/${id}`);
  }

  updateCard(id: number, payload: Partial<{ title: string; description: string; assigneeId: number; status: string }>) {
    return this.http.patch<Card>(`${this.baseUrl}/cards/${id}`, payload);
  }

  addComment(cardId: number, content: string) {
    return this.http.post<Comment>(`${this.baseUrl}/cards/${cardId}/comments`, { content });
  }

  deleteComment(cardId: number, commentId: number) {
    return this.http.delete(`${this.baseUrl}/cards/${cardId}/comments/${commentId}`);
  }

  uploadAttachment(cardId: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.baseUrl}/cards/${cardId}/attachments`, form);
  }

  deleteAttachment(cardId: number, attachmentId: number) {
    return this.http.delete(`${this.baseUrl}/cards/${cardId}/attachments/${attachmentId}`);
  }

  getAttachmentUrl(url: string) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${this.apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  deleteCard(id: number) {
    return this.http.delete(`${this.baseUrl}/cards/${id}`);
  }

  createSubtask(parentId: number, payload: { title: string; description?: string }) {
    return this.http.post<Card>(`${this.baseUrl}/cards/${parentId}/subtasks`, payload);
  }

  getSubtasks(cardId: number) {
    return this.http.get<Card[]>(`${this.baseUrl}/cards/${cardId}/subtasks`);
  }

  getDashboardSummary(from: string, to: string) {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`, { params });
  }
}
