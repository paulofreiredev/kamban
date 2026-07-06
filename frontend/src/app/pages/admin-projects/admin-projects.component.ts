import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Project, User } from '../../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-projects.component.html',
  styleUrls: ['./admin-projects.component.css']
})
export class AdminProjectsComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  users: User[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  showNewProjectForm = false;
  showEditProjectForm = false;
  showMembersModal = false;
  selectedProject: Project | null = null;
    showDeleteConfirmModal = false;
    projectToDelete: Project | null = null;
  
  newProjectForm: FormGroup;
  editProjectForm: FormGroup;
  addMemberForm: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private fb: FormBuilder
  ) {
    this.newProjectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      memberIds: [[]]
    });
    
    this.editProjectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
    
    this.addMemberForm = this.fb.group({
      userId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.loading = true;
    this.api.listProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.projects = projects;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar projetos:', err);
          this.error = 'Erro ao carregar projetos';
          this.loading = false;
        }
      });
  }

  loadUsers(): void {
    this.api.listUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (err) => {
          console.error('Erro ao carregar usuários:', err);
        }
      });
  }

  openNewProjectForm(): void {
    this.newProjectForm.reset();
    this.showNewProjectForm = true;
  }

  closeNewProjectForm(): void {
    this.showNewProjectForm = false;
  }

  submitNewProject(): void {
    if (!this.newProjectForm.valid) return;
    
    const payload = this.newProjectForm.value;
    this.api.createProject(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Projeto criado com sucesso';
          this.closeNewProjectForm();
          this.loadProjects();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = 'Erro ao criar projeto';
          console.error(err);
        }
      });
  }

  openEditProjectForm(project: Project): void {
    this.selectedProject = project;
    this.editProjectForm.patchValue({
      title: project.title,
      description: project.description
    });
    this.showEditProjectForm = true;
  }

  closeEditProjectForm(): void {
    this.showEditProjectForm = false;
    this.selectedProject = null;
  }

  submitEditProject(): void {
    if (!this.editProjectForm.valid || !this.selectedProject) return;
    
    const payload = this.editProjectForm.value;
    this.api.updateProject(this.selectedProject.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Projeto atualizado com sucesso';
          this.closeEditProjectForm();
          this.loadProjects();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = 'Erro ao atualizar projeto';
          console.error(err);
        }
      });
  }

  deactivateProject(projectId: number): void {
    if (!confirm('Tem certeza que deseja inativar este projeto?')) return;
    
    this.api.deactivateProject(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Projeto inativado com sucesso';
          this.loadProjects();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = 'Erro ao inativar projeto';
          console.error(err);
        }
      });
  }

  deleteProject(projectId: number): void {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    this.projectToDelete = project;
    this.showDeleteConfirmModal = true;
  }

  confirmDeleteProject(): void {
    if (!this.projectToDelete) return;
    const projectId = this.projectToDelete.id;
    
    this.api.deleteProject(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Projeto deletado com sucesso';
          this.closeDeleteConfirmModal();
          this.loadProjects();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = 'Erro ao deletar projeto';
          console.error(err);
        }
      });
  }

  closeDeleteConfirmModal(): void {
    this.showDeleteConfirmModal = false;
    this.projectToDelete = null;
  }

  openMembersModal(project: Project): void {
    this.selectedProject = project;
    this.addMemberForm.reset();
    this.showMembersModal = true;
  }

  closeMembersModal(): void {
    this.showMembersModal = false;
    this.selectedProject = null;
  }

  addMember(): void {
    if (!this.addMemberForm.valid || !this.selectedProject) return;
    
    const userId = this.addMemberForm.get('userId')?.value;
    this.api.addProjectMember(this.selectedProject.id, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Membro adicionado com sucesso';
          this.loadProjects();
          this.addMemberForm.reset();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = 'Erro ao adicionar membro';
          console.error(err);
        }
      });
  }

  removeMember(memberId: number): void {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    if (!this.selectedProject) return;
    
    this.api.removeProjectMember(this.selectedProject.id, memberId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Membro removido com sucesso';
          this.loadProjects();
          if (this.selectedProject) {
            const updated = this.projects.find(p => p.id === this.selectedProject!.id);
            if (updated) this.selectedProject = updated;
          }
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          this.error = 'Erro ao remover membro';
          console.error(err);
        }
      });
  }

  getUnassignedUsers(): User[] {
    if (!this.selectedProject) return this.users;
    const assignedIds = new Set(this.selectedProject.members?.map(m => m.userId) || []);
    return this.users.filter(u => !assignedIds.has(u.id));
  }
}
