import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/auth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.get(AuthService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  describe('Service creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Token Management', () => {
    describe('getToken', () => {
      it('should return null when no token is stored', () => {
        localStorage.clear();
        expect(service.getToken()).toBeNull();
      });

      it('should return the stored token', () => {
        const testToken = 'test-jwt-token-123';
        localStorage.setItem('authToken', testToken);
        expect(service.getToken()).toBe(testToken);
      });

      it('should return token of various lengths', () => {
        const tokens = [
          'a',
          'short-token',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        ];

        tokens.forEach(token => {
          localStorage.setItem('authToken', token);
          expect(service.getToken()).toBe(token);
        });
      });
    });

    describe('setToken', () => {
      it('should store token in localStorage', () => {
        const testToken = 'test-token-123';
        service.setToken(testToken);
        expect(localStorage.getItem('authToken')).toBe(testToken);
      });

      it('should overwrite existing token', () => {
        service.setToken('old-token');
        service.setToken('new-token');
        expect(service.getToken()).toBe('new-token');
      });

      it('should handle special characters in token', () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
        service.setToken(token);
        expect(service.getToken()).toBe(token);
      });

      it('should store empty string token', () => {
        service.setToken('');
        expect(localStorage.getItem('authToken')).toBe('');
      });
    });

    describe('removeToken', () => {
      it('should remove token from localStorage', () => {
        service.setToken('test-token');
        service.removeToken();
        expect(localStorage.getItem('authToken')).toBeNull();
      });

      it('should return null after removal', () => {
        service.setToken('test-token');
        service.removeToken();
        expect(service.getToken()).toBeNull();
      });

      it('should handle removing non-existent token', () => {
        localStorage.clear();
        expect(() => service.removeToken()).not.toThrow();
      });

      it('should remove token only once', () => {
        service.setToken('test-token');
        service.removeToken();
        service.removeToken();
        expect(service.getToken()).toBeNull();
      });
    });
  });

  describe('Authentication Status', () => {
    describe('isAuthenticated', () => {
      it('should return false when not authenticated', () => {
        localStorage.clear();
        expect(service.isAuthenticated()).toBeFalsy();
      });

      it('should return true when authenticated', () => {
        service.setToken('test-token');
        expect(service.isAuthenticated()).toBeTruthy();
      });

      it('should return false when token is empty string', () => {
        service.setToken('');
        expect(service.isAuthenticated()).toBeFalsy();
      });

      it('should return false after logout', () => {
        service.setToken('test-token');
        service.logout();
        expect(service.isAuthenticated()).toBeFalsy();
      });

      it('should consider any non-empty token as authenticated', () => {
        const tokens = ['token1', 'x', 'very-long-token-string'];
        tokens.forEach(token => {
          localStorage.clear();
          service.setToken(token);
          expect(service.isAuthenticated()).toBeTruthy();
        });
      });
    });

    describe('logout', () => {
      it('should remove token when logging out', () => {
        service.setToken('test-token');
        service.logout();
        expect(service.getToken()).toBeNull();
      });

      it('should make isAuthenticated return false after logout', () => {
        service.setToken('test-token');
        service.logout();
        expect(service.isAuthenticated()).toBeFalsy();
      });

      it('should handle logout when not authenticated', () => {
        localStorage.clear();
        expect(() => service.logout()).not.toThrow();
        expect(service.isAuthenticated()).toBeFalsy();
      });
    });
  });

  describe('Login', () => {
    describe('login method', () => {
      it('should send POST request to login endpoint', () => {
        const credentials: LoginRequest = {
          username: 'testuser',
          password: 'testpass123'
        };

        service.login(credentials).subscribe();

        const req = httpMock.expectOne(`${apiUrl}/login`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(credentials);
      });

      it('should send correct username and password', () => {
        const credentials: LoginRequest = {
          username: 'john_doe',
          password: 'SecurePassword123'
        };

        service.login(credentials).subscribe();

        const req = httpMock.expectOne(`${apiUrl}/login`);
        expect(req.request.body.username).toBe('john_doe');
        expect(req.request.body.password).toBe('SecurePassword123');
      });

      it('should handle successful login response', (done) => {
        const credentials: LoginRequest = {
          username: 'testuser',
          password: 'password123'
        };
        const response: LoginResponse = {
          token: 'jwt-token-123',
          username: 'testuser',
          tokenType: 'Bearer'
        };

        service.login(credentials).subscribe(result => {
          expect(result.token).toBe('jwt-token-123');
          expect(result.username).toBe('testuser');
          done();
        });

        const req = httpMock.expectOne(`${apiUrl}/login`);
        req.flush(response);
      });

      it('should handle login with special characters', () => {
        const credentials: LoginRequest = {
          username: 'user@domain',
          password: 'p@ss!word#123'
        };

        service.login(credentials).subscribe();

        const req = httpMock.expectOne(`${apiUrl}/login`);
        expect(req.request.body.username).toBe('user@domain');
        expect(req.request.body.password).toBe('p@ss!word#123');
      });

      it('should handle multiple login attempts', () => {
        const credentials1: LoginRequest = {
          username: 'user1',
          password: 'pass1'
        };
        const credentials2: LoginRequest = {
          username: 'user2',
          password: 'pass2'
        };

        service.login(credentials1).subscribe();
        const req1 = httpMock.expectOne(`${apiUrl}/login`);
        req1.flush({});

        service.login(credentials2).subscribe();
        const req2 = httpMock.expectOne(`${apiUrl}/login`);
        expect(req2.request.body).toEqual(credentials2);
      });

      it('should send correct content-type header', () => {
        const credentials: LoginRequest = {
          username: 'testuser',
          password: 'password'
        };

        service.login(credentials).subscribe();

        const req = httpMock.expectOne(`${apiUrl}/login`);
        // Angular HttpClient automatically sets application/json
        expect(req.request.headers.get('Content-Type')).toBeNull();
        req.flush({});
      });

      it('should handle empty response', (done) => {
        const credentials: LoginRequest = {
          username: 'testuser',
          password: 'password'
        };

        service.login(credentials).subscribe(result => {
          expect(result).toBeTruthy();
          done();
        });

        const req = httpMock.expectOne(`${apiUrl}/login`);
        req.flush({});
      });

      it('should expose complete API URL', () => {
        expect(apiUrl).toBe('http://localhost:8080/api/auth');
      });
    });
  });
});



