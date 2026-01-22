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
  isMockMode = false; // Mock desabilitado - usando backend real em localhost:8080
  showDevTools = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public studentsService: StudentsService
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
    // Desabilitar mock mode e forçar uso do backend
    this.isMockMode = false;
    this.studentsService.setMockMode(false);
  }

  toggleMockMode(): void {
    // DESABILITADO - Mock mode removido da UI
    // this.isMockMode = !this.isMockMode;
    // this.studentsService.setMockMode(this.isMockMode);
  }

  seedTestData(): void {
    // DESABILITADO - Mock mode removido da UI
    // this.studentsService.seedMockTestData();
    // alert('Dados de teste adicionados! (Mock Mode)');
  }

  clearMockData(): void {
    // DESABILITADO - Mock mode removido da UI
    // if (confirm('Tem certeza que deseja limpar todos os dados mock?')) {
    //   this.studentsService.clearMockData();
    //   alert('Dados mock limpos!');
    // }
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}
