import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Project } from '../../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-project-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-select.component.html',
  styleUrls: ['./project-select.component.css']
})
export class ProjectSelectComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = null;
    this.api.listProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.projects = projects.filter(p => p.isActive);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar projetos:', err);
          this.error = 'Erro ao carregar projetos';
          this.loading = false;
        }
      });
  }

  selectProject(project: Project): void {
    this.authService.selectProject(project.id, project.title);
    this.router.navigateByUrl('/');
  }

  logout(): void {
    this.authService.logout();
  }
}
