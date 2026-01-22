import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'start-dev';
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.removeToken();
        this.isAuthenticated = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, fazer logout local
        this.authService.removeToken();
        this.isAuthenticated = false;
        this.router.navigate(['/login']);
      }
    });
  }
}
