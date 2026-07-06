import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth.guard';
import { projectAccessGuard } from './core/project.guard';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminProjectsComponent } from './pages/admin-projects/admin-projects.component';
import { ProjectSelectComponent } from './pages/project-select/project-select.component';
import { NoProjectComponent } from './pages/no-project/no-project.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'projects/select', component: ProjectSelectComponent, canActivate: [authGuard] },
  { path: 'no-project', component: NoProjectComponent, canActivate: [authGuard] },
  { path: '', component: HomeComponent, canActivate: [authGuard, projectAccessGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'admin/projects', component: AdminProjectsComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
