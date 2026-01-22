import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StudentsService } from '../services/students.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private studentsService: StudentsService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Em modo teste (mock), permite acesso sem autenticação
    if (this.studentsService.isMockEnabled()) {
      return true;
    }

    // Em modo real (backend), requer autenticação
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Não autenticado e não em modo teste, redirecionar para login
    this.router.navigate(['/login']);
    return false;
  }
}
