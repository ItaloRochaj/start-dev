import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.get(AuthGuard);
    authService = TestBed.get(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.get(Router) as jasmine.SpyObj<Router>;

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/students' } as RouterStateSnapshot;
  });

  describe('canActivate', () => {
    it('should create guard', () => {
      expect(guard).toBeTruthy();
    });

    it('should allow access when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should call isAuthenticated method from authService', () => {
      authService.isAuthenticated.and.returnValue(true);

      guard.canActivate(mockRoute, mockState);

      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
    });

    it('should redirect to login when authentication fails', () => {
      authService.isAuthenticated.and.returnValue(false);

      guard.canActivate(mockRoute, mockState);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should return false even when trying to access protected routes without authentication', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = guard.canActivate(mockRoute, { url: '/admin' } as RouterStateSnapshot);

      expect(result).toBe(false);
    });
  });
});



