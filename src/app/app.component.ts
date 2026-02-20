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
  showDevTools = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  logout(): void {
    try {
      this.authService.logout();
    } finally {
      this.isAuthenticated = false;
      this.router.navigate(['/login']);
    }
  }
}
