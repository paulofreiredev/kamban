import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { User, UserRole } from '../../models';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmDialogComponent],
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
  confirmDialog = signal<{
    title: string;
    message: string;
    description?: string;
    confirmText: string;
    tone: 'primary' | 'danger';
    action: () => void;
  } | null>(null);

  constructor(private api: ApiService, public auth: AuthService, private router: Router) {
	if (!this.auth.isAdmin()) {
		this.router.navigateByUrl('/');
		return;
	}
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

    const payload: any = { name: this.editName, email: this.editEmail };

    if (!this.isSelf(user) && this.auth.isAdmin()) {
      payload.role = this.editRole;
    }

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

  openConfirmDialog(config: {
    title: string;
    message: string;
    description?: string;
    confirmText: string;
    tone: 'primary' | 'danger';
    action: () => void;
  }) {
    this.confirmDialog.set(config);
  }

  closeConfirmDialog() {
    this.confirmDialog.set(null);
  }

  confirmCurrentAction() {
    const dialog = this.confirmDialog();
    if (!dialog) return;
    this.closeConfirmDialog();
    dialog.action();
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
    this.openConfirmDialog({
      title: 'Resetar senha',
      message: `Deseja resetar a senha de ${user.name}?`,
      description: `A nova senha passará a ser o email ${user.email}.`,
      confirmText: 'Resetar senha',
      tone: 'primary',
      action: () => this.api.resetUserPasswordToEmail(user.id).subscribe({
        next: () => this.success.set(`Senha de ${user.name} resetada para o email do usuário.`),
        error: (err) => this.error.set(err?.error?.message || 'Falha ao resetar senha')
      })
    });
  }

  isSelf(user: User): boolean {
    return this.auth.user()?.id === user.id;
  }

  canEditRole(user: User | null): boolean {
    return !!user && this.auth.isAdmin() && !this.isSelf(user);
  }
}
