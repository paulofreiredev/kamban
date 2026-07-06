import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Card, Comment, DashboardSummary, LoginResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = (window as any).__env?.apiUrl || 'http://localhost:8080/api';

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

  listCards(from: string, to: string, assigneeId?: number | string) {
    let params = new HttpParams().set('from', from).set('to', to);
    if (assigneeId) {
      params = params.set('assigneeId', assigneeId.toString());
    }
    return this.http.get<Card[]>(`${this.baseUrl}/cards`, { params });
  }

  createCard(payload: { title: string; description: string; assigneeId?: number; status?: string }) {
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

  uploadAttachment(cardId: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.baseUrl}/cards/${cardId}/attachments`, form);
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
