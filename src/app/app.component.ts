import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { StudentsService } from './services/students.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'start-dev';
  isAuthenticated = false;
  isMockMode = false;
  showDevTools = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public studentsService: StudentsService
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isMockMode = this.studentsService.isMockEnabled();
  }

  toggleMockMode(): void {
    this.isMockMode = !this.isMockMode;
    this.studentsService.setMockMode(this.isMockMode);
  }

  seedTestData(): void {
    this.studentsService.seedMockTestData();
    alert('Dados de teste adicionados! (Mock Mode)');
  }

  clearMockData(): void {
    if (confirm('Tem certeza que deseja limpar todos os dados mock?')) {
      this.studentsService.clearMockData();
      alert('Dados mock limpos!');
    }
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}
