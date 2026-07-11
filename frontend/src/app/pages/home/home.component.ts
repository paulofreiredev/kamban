import { Component, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Card, CardStatus, User } from '../../models';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

const STATUS_COLUMNS: { key: CardStatus; label: string }[] = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'todo', label: 'A Fazer' },
  { key: 'in_progress', label: 'Em Progresso' },
  { key: 'in_review', label: 'Em Revisão' },
  { key: 'done', label: 'Concluído' },
  { key: 'cancelled', label: 'Cancelado' }
];

const statusOrder: Record<CardStatus, number> = {
  'backlog': 0,
  'todo': 1,
  'in_progress': 2,
  'in_review': 3,
  'done': 4,
  'cancelled': 5
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, DragDropModule, ConfirmDialogComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
  columns = STATUS_COLUMNS;
  readonly dropListIds = STATUS_COLUMNS.map((column) => column.key);
  public projectTitle: string | null;
  private readonly projectTitleKey = 'kamban_selected_project_title';
  cards = signal<Card[]>([]);
  users = signal<User[]>([]);
  selectedCard = signal<Card | null>(null);
  showNewCardModal = signal(false);
  showJustificationModal = signal(false);
  showDetailsDrawer = signal(false);
  showPasswordModal = signal(false);
  savingAssignee = signal(false);
  loading = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');
  newSubtaskTitle = signal('');
  creatingSubtask = signal(false);
  confirmDialog = signal<{
    title: string;
    message: string;
    description?: string;
    confirmText: string;
    tone: 'primary' | 'danger';
    action: () => void;
  } | null>(null);

  fromDate = this.toDateInput(this.daysAgo(30));
  toDate = this.toDateInput(new Date());
  selectedAssigneeId: number | '' = '';

  newCardForm: FormGroup;
  justificationForm: FormGroup;

  pendingCardMove: { cardId: number; fromStatus: CardStatus; toStatus: CardStatus } | null = null;
  isDragging = false;
  detailAssigneeId: number | '' = '';
  nowTick = signal(Date.now());
  private tickIntervalId: ReturnType<typeof setInterval> | null = null;

  newComment = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  grouped = computed(() => {
    const out: Record<string, Card[]> = {};
    for (const c of STATUS_COLUMNS) out[c.key] = [];
    for (const card of this.cards()) out[card.status]?.push(card);
    return out;
  });

  constructor(
    public auth: AuthService,
    public api: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.projectTitle = this.loadProjectTitle();
    this.newCardForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      assigneeId: ['']
    });

    this.justificationForm = this.fb.group({
      justification: ['', [Validators.required, Validators.minLength(1)]]
    });

    this.tickIntervalId = setInterval(() => {
      this.nowTick.set(Date.now());
    }, 60_000);

    this.reloadUsers();
    this.reloadCards();
  }

  ngOnDestroy(): void {
    if (this.tickIntervalId) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  private daysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  private loadProjectTitle(): string | null {
    return localStorage.getItem(this.projectTitleKey);
  }

  private toDateInput(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  reloadUsers() {
    this.api.listUsers().subscribe({ next: (users) => this.users.set(users) });
  }

  reloadCards() {
    this.loading.set(true);
    const projectId = this.auth.selectedProjectId();
    if (!projectId) {
      this.loading.set(false);
      return;
    }
    
    const params: any = { projectId, from: this.fromDate, to: this.toDate };
    if (this.selectedAssigneeId !== '') {
      params.assigneeId = this.selectedAssigneeId;
    }
    this.api.listCards(projectId, params.from, params.to, params.assigneeId).subscribe({
      next: (cards) => {
        this.cards.set(cards);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openNewCardModal() {
    this.newCardForm.reset();
    this.showNewCardModal.set(true);
  }

  closeNewCardModal() {
    this.showNewCardModal.set(false);
  }

  switchProject() {
    this.auth.selectProject(0, '');
    this.router.navigateByUrl('/projects/select');
  }

  openPasswordModal() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError.set('');
    this.passwordSuccess.set('');
    this.showPasswordModal.set(true);
  }

  closePasswordModal() {
    this.showPasswordModal.set(false);
  }

  submitPasswordChange() {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError.set('Preencha todos os campos.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError.set('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('A confirmação da senha não confere.');
      return;
    }

    this.api.changeMyPassword({ currentPassword: this.currentPassword, newPassword: this.newPassword }).subscribe({
      next: (res) => {
        this.passwordSuccess.set(res.message || 'Senha alterada com sucesso.');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => this.passwordError.set(err?.error?.message || 'Não foi possível alterar a senha')
    });
  }

  submitNewCard() {
    if (!this.newCardForm.valid) return;
    const projectId = this.auth.selectedProjectId();
    if (!projectId) return;
    
    const payload: any = {
      projectId,
      title: this.newCardForm.get('title')?.value,
      description: this.newCardForm.get('description')?.value || '',
      status: 'backlog'
    };
    const assigneeId = this.newCardForm.get('assigneeId')?.value;
    if (assigneeId) payload.assigneeId = Number(assigneeId);

    this.api.createCard(payload).subscribe({
      next: (card) => {
        this.closeNewCardModal();
        // Open the card details modal for subtask creation
        this.openCard(card);
        this.cards.update(items=>[...items, card]);
      }
    });
  }

  onFilterChange() {
    this.reloadCards();
  }

  isRegression(fromStatus: CardStatus, toStatus: CardStatus): boolean {
    return statusOrder[toStatus] < statusOrder[fromStatus];
  }

  isCancellation(toStatus: CardStatus): boolean {
    return toStatus === 'cancelled';
  }

  onCardDrop(event: CdkDragDrop<Card[]>, targetStatus: CardStatus) {
    if (event.previousContainer === event.container) return;

    const card = event.previousContainer.data[event.previousIndex];
    if (!card) return;

    // Check subtask validation rules
    if (card.isSubtask) {
      // Find parent to check if it's in progress
      const parentCard = this.cards().find(c => c.id === card.parentId);
      if (parentCard && parentCard.status !== 'in_progress') {
        this.openConfirmDialog({
          title: 'Não permitido',
          message: 'Subtarefa só pode ser alterada se a atividade pai estiver em progresso',
          confirmText: 'OK',
          tone: 'primary',
          action: () => {} // No-op
        });
        return;
      }
    }

    // Check if trying to complete a parent task with incomplete subtasks
    if (!card.isSubtask && card.subtasks && card.subtasks.length > 0) {
      if (targetStatus === 'done' || targetStatus === 'cancelled') {
        const incompleteTasks = card.subtasks.filter(st => st.status !== 'done' && st.status !== 'cancelled');
        if (incompleteTasks.length > 0) {
          this.openConfirmDialog({
            title: 'Não permitido',
            message: `Não é possível concluir: ${incompleteTasks.length} subtarefa(s) não está(estão) concluída(s) ou cancelada(s)`,
            confirmText: 'OK',
            tone: 'primary',
            action: () => {} // No-op
          });
          return;
        }
      }
    }

    if (this.isRegression(card.status, targetStatus) || this.isCancellation(targetStatus)) {
      this.pendingCardMove = { cardId: card.id, fromStatus: card.status, toStatus: targetStatus };
      this.showJustificationModal.set(true);
    } else {
      this.moveCard(card.id, targetStatus, null);
    }
  }

  submitJustification() {
    if (!this.justificationForm.valid || !this.pendingCardMove) return;
    const justification = this.justificationForm.get('justification')?.value;
    this.moveCard(this.pendingCardMove.cardId, this.pendingCardMove.toStatus, justification);
    this.showJustificationModal.set(false);
    this.justificationForm.reset();
    this.pendingCardMove = null;
  }

  closeJustificationModal() {
    this.showJustificationModal.set(false);
    this.pendingCardMove = null;
  }

  private moveCard(cardId: number, newStatus: CardStatus, justification: string | null) {
    const previousCards = this.cards();
    this.cards.set(
      previousCards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus, justification: justification ?? card.justification } : card
      )
    );

    const payload: any = { status: newStatus };
    if (justification) payload.justification = justification;

    this.api.updateCard(cardId, payload).subscribe({
      next: () => this.reloadCards(),
      error: (err) => {
        // Restore previous state on error
        this.cards.set(previousCards);
        // Show error message from backend
        const errorMsg = err?.error?.message || 'Não foi possível mover a atividade';
        this.openConfirmDialog({
          title: 'Erro ao mover atividade',
          message: errorMsg,
          confirmText: 'OK',
          tone: 'primary',
          action: () => {}
        });
      }
    });
  }

  onDragStarted() {
    this.isDragging = true;
  }

  onDragEnded() {
    setTimeout(() => {
      this.isDragging = false;
    });
  }

  onCardClick(card: Card) {
    if (this.isDragging) return;
    this.openCard(card);
  }

  openCard(card: Card) {
    this.api.getCard(card.id).subscribe({
      next: (full) => {
        this.selectedCard.set(full);
        this.detailAssigneeId = full.assigneeId ?? '';
        this.showDetailsDrawer.set(true);
      }
    });
  }

  canDeleteComment(comment: { createdBy: number }): boolean {
    const currentUser = this.auth.user();
    return !!currentUser && (this.auth.isAdmin() || comment.createdBy === currentUser.id);
  }

  canDeleteAttachment(attachment: { uploadedBy: number }): boolean {
    const currentUser = this.auth.user();
    return !!currentUser && (this.auth.isAdmin() || attachment.uploadedBy === currentUser.id);
  }

  saveCardAssignee() {
    const card = this.selectedCard();
    if (!card || this.detailAssigneeId === '') return;

    this.savingAssignee.set(true);
    const nextAssigneeId = Number(this.detailAssigneeId);

    this.api.updateCard(card.id, { assigneeId: nextAssigneeId }).subscribe({
      next: (updated) => {
        this.selectedCard.set(updated);
        this.detailAssigneeId = updated.assigneeId ?? '';
        this.cards.set(
          this.cards().map((item) =>
            item.id === updated.id
              ? { ...item, assigneeId: updated.assigneeId ?? null, assigneeName: updated.assigneeName ?? '', assignee: updated.assignee ?? null }
              : item
          )
        );
        this.savingAssignee.set(false);
      },
      error: () => this.savingAssignee.set(false)
    });
  }

  closeDetailsDrawer() {
    this.selectedCard.set(null);
    this.showDetailsDrawer.set(false);
    this.detailAssigneeId = '';
    this.newComment = '';
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

  deleteSelectedCard() {
    const card = this.selectedCard();
    if (!card) return;
    this.openConfirmDialog({
      title: 'Excluir atividade',
      message: `Deseja excluir a atividade "${card.title}"?`,
      description: 'Essa ação remove a atividade de forma permanente.',
      confirmText: 'Excluir atividade',
      tone: 'danger',
      action: () => this.api.deleteCard(card.id).subscribe({
        next: () => {
          this.cards.set(this.cards().filter(c => c.id !== card.id));
          this.closeDetailsDrawer();
        }
      })
    });
  }

  addComment() {
    const card = this.selectedCard();
    if (!card || !this.newComment.trim()) return;
    this.api.addComment(card.id, this.newComment).subscribe({
      next: () => {
        this.newComment = '';
        this.openCard(card);
      }
    });
  }

  deleteComment(commentId: number) {
    const card = this.selectedCard();
    if (!card) return;
    this.openConfirmDialog({
      title: 'Excluir comentário',
      message: 'Deseja excluir este comentário?',
      description: 'O comentário será removido imediatamente da atividade.',
      confirmText: 'Excluir comentário',
      tone: 'danger',
      action: () => this.api.deleteComment(card.id, commentId).subscribe({
        next: () => this.openCard(card)
      })
    });
  }

  onFileChange(evt: Event) {
    const card = this.selectedCard();
    if (!card) return;
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.api.uploadAttachment(card.id, file).subscribe({
      next: () => {
        input.value = '';
        this.openCard(card);
      }
    });
  }

  deleteAttachment(attachmentId: number) {
    const card = this.selectedCard();
    if (!card) return;
    this.openConfirmDialog({
      title: 'Excluir anexo',
      message: 'Deseja excluir este anexo?',
      description: 'O arquivo será removido da atividade e do armazenamento.',
      confirmText: 'Excluir anexo',
      tone: 'danger',
      action: () => this.api.deleteAttachment(card.id, attachmentId).subscribe({
        next: () => this.openCard(card)
      })
    });
  }

  getUserName(userId: number | undefined): string {
    if (!userId) return 'N/A';
    return this.users().find(u => u.id === userId)?.name || 'N/A';
  }

  getAssigneeName(card: Card): string {
    if (card.assigneeName) return card.assigneeName;
    return this.getUserName(card.assigneeId ?? undefined);
  }

  getTimeInCurrentColumn(card: Card): string {
    this.nowTick();

    const parsedStatusChangedAt = card.statusChangedAt ? new Date(card.statusChangedAt) : null;
    const hasValidStatusChangedAt = !!parsedStatusChangedAt && !Number.isNaN(parsedStatusChangedAt.getTime()) && parsedStatusChangedAt.getFullYear() >= 2000;
    const startedAtRaw = hasValidStatusChangedAt ? card.statusChangedAt! : card.createdAt;
    const startedAt = new Date(startedAtRaw).getTime();
    const now = Date.now();

    if (Number.isNaN(startedAt) || startedAt > now) {
      return '0min';
    }

    const diffMs = now - startedAt;
    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 60) {
      return `${minutes}min`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  createSubtask(): void {
    const title = this.newSubtaskTitle().trim();
    if (!title || !this.selectedCard()) {
      return;
    }

    this.creatingSubtask.set(true);
    this.api.createSubtask(this.selectedCard()!.id, { title })
      .subscribe({
        next: (subtask: Card) => {
          const selected = this.selectedCard();
          if (selected) {
            if (!selected.subtasks) {
              selected.subtasks = [];
            }
            selected.subtasks.push(subtask);
            this.selectedCard.set({ ...selected });
          }
          this.newSubtaskTitle.set('');
          this.creatingSubtask.set(false);
        },
        error: (err) => {
          this.creatingSubtask.set(false);
          const errorMsg = err?.error?.message || 'Não foi possível criar a subtarefa';
          this.openConfirmDialog({
            title: 'Erro ao criar subtarefa',
            message: errorMsg,
            confirmText: 'OK',
            tone: 'primary',
            action: () => {}
          });
        }
      });
  }

  updateSubtaskStatus(subtaskId: number, event: any): void {
    const isChecked = event.target.checked;
    const newStatus: CardStatus = isChecked ? 'done' : 'backlog';
    
    this.api.updateCard(subtaskId, { status: newStatus })
      .subscribe({
        next: (updated: Card) => {
          const selected = this.selectedCard();
          if (selected && selected.subtasks) {
            const idx = selected.subtasks.findIndex(s => s.id === subtaskId);
            if (idx >= 0) {
              selected.subtasks[idx] = updated;
              this.selectedCard.set({ ...selected });
            }
          }
        }
      });
  }

  getSubtaskProgress(card: Card | null): { done: number; total: number } {
    if (!card || !card.subtasks || card.subtasks.length === 0) {
      return { done: 0, total: 0 };
    }
    const done = card.subtasks.filter(st => st.status === 'done').length;
    return { done, total: card.subtasks.length };
  }

  hasWarning(card: Card | null): boolean {
    if (!card) return false;
    // Show warning if card is cancelled, or has justification
    return card.status === 'cancelled' || !!card.justification;
  }

  canCreateSubtask(): boolean {
    const card = this.selectedCard();
    if (!card || card.isSubtask) return false;
    // Cannot create subtasks for finished or cancelled tasks
    return card.status !== 'done' && card.status !== 'cancelled';
  }

  canDragDropCard(card: Card): boolean {
    // If this is a subtask, check if parent is in progress
    if (card.isSubtask && card.parentId) {
      // We need to find parent status - for now allow by default
      // The backend will validate on drop
      return true;
    }
    return true;
  }

  getSubtaskTransitionError(card: Card | null): string | null {
    if (!card || !card.isSubtask) return null;
    
    // Find parent card to check its status
    const allCards = this.cards();
    const parentCard = allCards.find(c => c.id === card.parentId);
    
    if (!parentCard) return null;
    
    // Subtask can only be completed if parent is in progress
    if (parentCard.status !== 'in_progress') {
      return 'Subtarefa só pode ser alterada se a atividade pai estiver em progresso';
    }
    
    return null;
  }

  getParentCompletionError(card: Card | null): string | null {
    if (!card || card.isSubtask) return null;
    
    const subtasks = card.subtasks || [];
    if (subtasks.length === 0) return null;
    
    const incompleteTasks = subtasks.filter(st => st.status !== 'done' && st.status !== 'cancelled');
    if (incompleteTasks.length > 0) {
      return `Não é possível concluir: ${incompleteTasks.length} subtarefa(s) não está(estão) concluída(s) ou cancelada(s)`;
    }
    
    return null;
  }
}
