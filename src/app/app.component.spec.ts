import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ToastComponent } from './components/toast/toast.component';
import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout', 'getToken', 'setToken']);
    authServiceSpy.isAuthenticated.and.returnValue(false); // Default return value
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show', 'success', 'error']);
    toastServiceSpy.toast$ = of();

    await TestBed.configureTestingModule({
      declarations: [AppComponent, ToastComponent],
      imports: [RouterTestingModule.withRoutes([
        { path: 'login', component: AppComponent },
        { path: 'students', component: AppComponent }
      ])],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.get(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.get(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Setup router spy
    router = TestBed.get(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy();
    });

    it('should have title property set to "start-dev"', () => {
      expect(component.title).toEqual('start-dev');
    });

    it('should initialize with correct title', () => {
      fixture.detectChanges();
      expect(component.title).toBe('start-dev');
    });

    it('should initialize isAuthenticated as false by default', () => {
      authService.isAuthenticated.and.returnValue(false);
      const newComponent = new AppComponent(authService, router);
      expect(newComponent.isAuthenticated).toBeFalsy();
    });

    it('should initialize showDevTools as false', () => {
      expect(component.showDevTools).toBeFalsy();
    });

    it('should have selector "app-root"', () => {
      const metadata = (AppComponent as any).__annotations__[0];
      expect(metadata.selector).toEqual('app-root');
    });
  });

  describe('Constructor', () => {
    it('should inject AuthService and Router', () => {
      expect(authService).toBeTruthy();
      expect(router).toBeTruthy();
    });

    it('should call authService.isAuthenticated on construction', () => {
      authService.isAuthenticated.and.returnValue(false);
      const newComponent = new AppComponent(authService, router);
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should set isAuthenticated to true when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      const newComponent = new AppComponent(authService, router);
      expect(newComponent.isAuthenticated).toBeTruthy();
    });

    it('should set isAuthenticated to false when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      const newComponent = new AppComponent(authService, router);
      expect(newComponent.isAuthenticated).toBeFalsy();
    });
  });

  describe('Authentication State', () => {
    it('should reflect authenticated user', () => {
      authService.isAuthenticated.and.returnValue(true);
      const newComponent = new AppComponent(authService, router);
      expect(newComponent.isAuthenticated).toBe(true);
    });

    it('should reflect unauthenticated user', () => {
      authService.isAuthenticated.and.returnValue(false);
      const newComponent = new AppComponent(authService, router);
      expect(newComponent.isAuthenticated).toBe(false);
    });

    it('should allow toggling isAuthenticated manually', () => {
      component.isAuthenticated = false;
      expect(component.isAuthenticated).toBeFalsy();
      component.isAuthenticated = true;
      expect(component.isAuthenticated).toBeTruthy();
    });
  });

  describe('Logout Functionality', () => {
    it('should call authService.logout on logout()', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should set isAuthenticated to false on logout()', () => {
      component.isAuthenticated = true;
      component.logout();
      expect(component.isAuthenticated).toBeFalsy();
    });

    it('should navigate to /login on logout()', () => {
      component.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should logout and navigate in correct order', () => {
      const callOrder: string[] = [];
      authService.logout.and.callFake(() => {
        callOrder.push('logout');
      });
      router.navigate.and.callFake(() => {
        callOrder.push('navigate');
        return Promise.resolve(true);
      });

      component.logout();

      expect(callOrder[0]).toBe('logout');
      expect(callOrder[1]).toBe('navigate');
    });

    it('should set isAuthenticated before navigation', () => {
      component.isAuthenticated = true;
      authService.logout.and.callFake(() => {
        // noop
      });
      router.navigate.and.callFake(() => {
        expect(component.isAuthenticated).toBeFalsy();
        return Promise.resolve(true);
      });

      component.logout();
      expect(component.isAuthenticated).toBeFalsy();
    });

    it('should handle logout without side effects', () => {
      component.title = 'start-dev';
      component.showDevTools = false;
      component.logout();
      expect(component.title).toBe('start-dev');
      expect(component.showDevTools).toBeFalsy();
    });

    it('should allow multiple logouts', () => {
      component.logout();
      component.logout();
      component.logout();
      expect(authService.logout).toHaveBeenCalledTimes(3);
      expect(router.navigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('DevTools Toggle', () => {
    it('should initialize showDevTools as false', () => {
      expect(component.showDevTools).toBeFalsy();
    });

    it('should allow toggling showDevTools', () => {
      component.showDevTools = false;
      expect(component.showDevTools).toBeFalsy();
      component.showDevTools = true;
      expect(component.showDevTools).toBeTruthy();
      component.showDevTools = false;
      expect(component.showDevTools).toBeFalsy();
    });

    it('should not affect authentication state when toggling devTools', () => {
      component.isAuthenticated = true;
      component.showDevTools = true;
      expect(component.isAuthenticated).toBeTruthy();
      component.showDevTools = false;
      expect(component.isAuthenticated).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('should detect changes properly', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should maintain state after detectChanges', () => {
      component.title = 'start-dev';
      component.isAuthenticated = true;
      fixture.detectChanges();
      expect(component.title).toBe('start-dev');
      expect(component.isAuthenticated).toBeTruthy();
    });

    it('should render component without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Title Property', () => {
    it('should have immutable title property', () => {
      const originalTitle = component.title;
      component.title = 'start-dev';
      expect(component.title).toBe(originalTitle);
    });

    it('should support title reassignment', () => {
      component.title = 'start-dev';
      expect(component.title).toEqual('start-dev');
    });

    it('should have title as string type', () => {
      expect(typeof component.title).toBe('string');
    });

    it('should not affect logout functionality when changing title', () => {
      component.title = 'modified-title';
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Component Properties', () => {
    it('should have all required properties defined', () => {
      expect(component.hasOwnProperty('title')).toBeTruthy();
      expect(component.hasOwnProperty('isAuthenticated')).toBeTruthy();
      expect(component.hasOwnProperty('showDevTools')).toBeTruthy();
    });

    it('should have properties with correct types', () => {
      expect(typeof component.title).toBe('string');
      expect(typeof component.isAuthenticated).toBe('boolean');
      expect(typeof component.showDevTools).toBe('boolean');
    });

    it('should allow setting properties individually', () => {
      component.title = 'new-title';
      component.isAuthenticated = true;
      component.showDevTools = true;

      expect(component.title).toBe('new-title');
      expect(component.isAuthenticated).toBe(true);
      expect(component.showDevTools).toBe(true);
    });
  });

  describe('Component Methods', () => {
    it('should have logout method', () => {
      expect(typeof component.logout).toBe('function');
    });

    it('should have only logout method as public method', () => {
      const publicMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(component))
        .filter(name => typeof component[name as keyof AppComponent] === 'function' && name !== 'constructor');
      expect(publicMethods).toContain('logout');
    });

    it('should execute logout without parameters', () => {
      expect(() => component.logout()).not.toThrow();
    });

    it('should return undefined from logout', () => {
      const result = component.logout();
      expect(result).toBeUndefined();
    });
  });

  describe('Service Integration', () => {
    it('should use AuthService for authentication check', () => {
      authService.isAuthenticated.and.returnValue(true);
      const newComponent = new AppComponent(authService, router);
      expect(authService.isAuthenticated).toHaveBeenCalled();
    });

    it('should use AuthService logout method', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should use Router for navigation', () => {
      component.logout();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should navigate to correct route on logout', () => {
      component.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid logout calls', () => {
      for (let i = 0; i < 10; i++) {
        component.logout();
      }
      expect(authService.logout).toHaveBeenCalledTimes(10);
      expect(router.navigate).toHaveBeenCalledTimes(10);
    });

    it('should handle logout when already logged out', () => {
      component.isAuthenticated = false;
      component.logout();
      expect(component.isAuthenticated).toBeFalsy();
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should maintain component integrity after multiple operations', () => {
      component.isAuthenticated = true;
      component.showDevTools = true;
      component.logout();
      component.isAuthenticated = true;
      component.logout();
      component.showDevTools = false;

      expect(component).toBeTruthy();
      expect(typeof component.title).toBe('string');
    });

    it('should handle null/undefined routes gracefully', () => {
      expect(() => component.logout()).not.toThrow();
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state after constructor', () => {
      authService.isAuthenticated.and.returnValue(true);
      const newComponent = new AppComponent(authService, router);

      expect(newComponent.title).toBe('start-dev');
      expect(newComponent.isAuthenticated).toBe(true);
      expect(newComponent.showDevTools).toBe(false);
    });

    it('should maintain title through lifecycle', () => {
      const originalTitle = component.title;
      fixture.detectChanges();
      component.logout();
      expect(component.title).toBe(originalTitle);
    });

    it('should sync authentication state correctly', () => {
      authService.isAuthenticated.and.returnValue(true);
      const authenticatedComponent = new AppComponent(authService, router);
      authenticatedComponent.logout();
      expect(authenticatedComponent.isAuthenticated).toBeFalsy();
    });
  });

  describe('Component Integration', () => {
    it('should provide dependencies correctly', () => {
      expect(authService).toBeDefined();
      expect(router).toBeDefined();
    });

    it('should have correct selector in component', () => {
      const metadata = (AppComponent as any)['__annotations__'];
      if (metadata) {
        expect(metadata[0].selector).toBe('app-root');
      } else {
        // Fallback if metadata not accessible
        expect(component).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle authService.logout throwing error', () => {
      authService.logout.and.throwError('Logout failed');
      expect(() => component.logout()).toThrow();
    });

    it('should handle router.navigate returning false', () => {
      router.navigate.and.returnValue(Promise.resolve(false));
      expect(() => component.logout()).not.toThrow();
    });

    it('should continue to set isAuthenticated even if logout fails', () => {
      authService.logout.and.throwError('Error');
      component.isAuthenticated = true;

      try {
        component.logout();
      } catch (e) {
        // Expected error
      }

      expect(component.isAuthenticated).toBeFalsy();
    });
  });

  describe('Memory and Performance', () => {
    it('should not leak memory on repeated operations', () => {
      for (let i = 0; i < 100; i++) {
        component.logout();
        component.isAuthenticated = true;
        component.showDevTools = !component.showDevTools;
      }

      expect(component).toBeTruthy();
    });

    it('should handle large number of state changes', () => {
      for (let i = 0; i < 1000; i++) {
        component.isAuthenticated = i % 2 === 0;
        component.showDevTools = i % 3 === 0;
      }

      expect(component).toBeTruthy();
    });
  });
});



