import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { User, UserRole } from '../../models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent {
  users = signal<User[]>([]);
  error = signal('');
  success = signal('');

  // Create form
  name = '';
  email = '';
  password = '';
  role: UserRole = 'member';

  // Edit modal
  editingUser = signal<User | null>(null);
  editName = '';
  editEmail = '';
  editPassword = '';
  editRole: UserRole = 'member';
  editError = signal('');

  // Delete confirm
  deletingUser = signal<User | null>(null);

  constructor(private api: ApiService, public auth: AuthService) {
    this.loadUsers();
  }

  loadUsers() {
    this.api.listUsers().subscribe({ next: (users) => this.users.set(users) });
  }

  submit() {
    this.error.set('');
    this.success.set('');
    this.api.createUser({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => {
        this.name = '';
        this.email = '';
        this.password = '';
        this.role = 'member';
        this.success.set('Usuário criado com sucesso.');
        this.loadUsers();
      },
      error: (err) => this.error.set(err?.error?.message || 'Falha ao cadastrar usuário')
    });
  }

  openEdit(user: User) {
    this.editingUser.set(user);
    this.editName = user.name;
    this.editEmail = user.email;
    this.editPassword = '';
    this.editRole = user.role;
    this.editError.set('');
  }

  closeEdit() {
    this.editingUser.set(null);
  }

  saveEdit() {
    const user = this.editingUser();
    if (!user) return;
    this.editError.set('');

    const payload: any = { name: this.editName, email: this.editEmail, role: this.editRole };
    if (this.editPassword.trim()) payload.password = this.editPassword;

    this.api.updateUser(user.id, payload).subscribe({
      next: (updated) => {
        this.users.set(this.users().map(u => u.id === updated.id ? updated : u));
        this.closeEdit();
      },
      error: (err) => this.editError.set(err?.error?.message || 'Falha ao atualizar usuário')
    });
  }

  toggleActive(user: User) {
    this.api.toggleUserActive(user.id).subscribe({
      next: (updated) => this.users.set(this.users().map(u => u.id === updated.id ? updated : u))
    });
  }

  openDelete(user: User) {
    this.deletingUser.set(user);
  }

  closeDelete() {
    this.deletingUser.set(null);
  }

  confirmDelete() {
    const user = this.deletingUser();
    if (!user) return;
    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.users.set(this.users().filter(u => u.id !== user.id));
        this.closeDelete();
      }
    });
  }

  resetPasswordToEmail(user: User) {
    this.error.set('');
    this.success.set('');
    if (this.isSelf(user)) {
      this.error.set('Use a opção "Alterar senha" para sua própria conta.');
      return;
    }
    const confirmed = confirm(`Resetar senha de ${user.name} para o email (${user.email})?`);
    if (!confirmed) return;

    this.api.resetUserPasswordToEmail(user.id).subscribe({
      next: () => this.success.set(`Senha de ${user.name} resetada para o email do usuário.`),
      error: (err) => this.error.set(err?.error?.message || 'Falha ao resetar senha')
    });
  }

  isSelf(user: User): boolean {
    return this.auth.user()?.id === user.id;
  }
}
