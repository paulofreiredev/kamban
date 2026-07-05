import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { DashboardSummary, DashboardUserProductivity } from '../../models';

type PieSlice = {
  status: string;
  label: string;
  count: number;
  color: string;
  percent: number;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  fromDate = this.toDateInput(this.daysAgo(30));
  toDate = this.toDateInput(new Date());

  loading = signal(false);
  error = signal('');
  summary = signal<DashboardSummary | null>(null);

  private readonly statusLabel: Record<string, string> = {
    backlog: 'Backlog',
    todo: 'A Fazer',
    in_progress: 'Em Progresso',
    in_review: 'Em Revisão',
    done: 'Concluído',
    cancelled: 'Cancelado'
  };

  private readonly statusColor: Record<string, string> = {
    backlog: '#94a3b8',
    todo: '#3b82f6',
    in_progress: '#f59e0b',
    in_review: '#8b5cf6',
    done: '#22c55e',
    cancelled: '#ef4444'
  };

  pieSlices = computed<PieSlice[]>(() => {
    const summary = this.summary();
    if (!summary) return [];
    const total = summary.statusCounts.reduce((acc, item) => acc + item.count, 0);
    return summary.statusCounts.map((item) => ({
      status: item.status,
      label: this.statusLabel[item.status] || item.status,
      count: item.count,
      color: this.statusColor[item.status] || '#9ca3af',
      percent: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));
  });

  totalTasks = computed(() => this.pieSlices().reduce((acc, item) => acc + item.count, 0));

  pieGradient = computed(() => {
    const slices = this.pieSlices();
    const total = this.totalTasks();
    if (!total) return 'conic-gradient(#e5e7eb 0 100%)';

    let current = 0;
    const parts: string[] = [];
    for (const slice of slices) {
      const start = Math.round((current / total) * 100);
      current += slice.count;
      const end = Math.round((current / total) * 100);
      parts.push(`${slice.color} ${start}% ${end}%`);
    }
    return `conic-gradient(${parts.join(', ')})`;
  });

  mostProductive = computed<DashboardUserProductivity | null>(() => {
    const users = this.summary()?.userProductivity || [];
    if (!users.length) return null;
    return [...users].sort((a, b) => (b.doneCount - a.doneCount) || (b.inProgressCount - a.inProgressCount))[0] || null;
  });

  leastProductive = computed<DashboardUserProductivity | null>(() => {
    const users = this.summary()?.userProductivity || [];
    if (!users.length) return null;
    return [...users].sort((a, b) => (a.doneCount - b.doneCount) || (a.inProgressCount - b.inProgressCount))[0] || null;
  });

  constructor(private api: ApiService) {
    this.load();
  }

  private daysAgo(days: number) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  private toDateInput(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  load() {
    this.loading.set(true);
    this.error.set('');

    this.api.getDashboardSummary(this.fromDate, this.toDate).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Falha ao carregar dashboard');
        this.loading.set(false);
      }
    });
  }

  isMost(u: DashboardUserProductivity): boolean {
    return this.mostProductive()?.userId === u.userId;
  }

  isLeast(u: DashboardUserProductivity): boolean {
    return this.leastProductive()?.userId === u.userId;
  }
}
