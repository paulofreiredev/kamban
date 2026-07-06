import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-no-project',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './no-project.component.html',
  styleUrls: ['./no-project.component.css']
})
export class NoProjectComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
