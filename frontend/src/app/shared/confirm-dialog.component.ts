import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="modal-backdrop" (click)="cancelled.emit()">
      <div class="modal modal-sm" [class.modal-danger]="tone === 'danger'" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button type="button" class="btn-close" (click)="cancelled.emit()">×</button>
        </div>

        <div class="modal-body">
          <p class="confirm-message">{{ message }}</p>
          <p *ngIf="description" class="confirm-description">{{ description }}</p>
          <ng-content></ng-content>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="cancelled.emit()">{{ cancelText }}</button>
          <button type="button" class="btn" [class.btn-danger]="tone === 'danger'" [class.btn-primary]="tone !== 'danger'" (click)="confirmed.emit()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-message {
      margin: 0;
      font-size: 1rem;
      color: #0f172a;
      line-height: 1.5;
    }

    .confirm-description {
      margin: 12px 0 0;
      color: #64748b;
      line-height: 1.5;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar ação';
  @Input() message = '';
  @Input() description = '';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() tone: 'primary' | 'danger' = 'primary';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
