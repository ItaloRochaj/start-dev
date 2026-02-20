import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler
} from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('JwtInterceptor', () => {
  let interceptor: JwtInterceptor;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getToken',
      'removeToken'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        JwtInterceptor,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    interceptor = TestBed.get(JwtInterceptor);
    authService = TestBed.get(AuthService) as jasmine.SpyObj<AuthService>;
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('intercept', () => {
    it('should create interceptor', () => {
      expect(interceptor).toBeTruthy();
    });

    it('should add Authorization header when token exists', (done) => {
      const token = 'test-jwt-token';
      const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      const response = new HttpResponse({ status: 200 });

      authService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(response));

      interceptor.intercept(request, mockHandler).subscribe(() => {
        expect(mockHandler.handle).toHaveBeenCalled();
        const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0];
        expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
        done();
      });
    });

    it('should not add Authorization header when token does not exist', (done) => {
      const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      const response = new HttpResponse({ status: 200 });

      authService.getToken.and.returnValue(null);
      mockHandler.handle.and.returnValue(of(response));

      interceptor.intercept(request, mockHandler).subscribe(() => {
        expect(mockHandler.handle).toHaveBeenCalled();
        const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0];
        expect(modifiedRequest.headers.get('Authorization')).toBeNull();
        done();
      });
    });

    it('should call getToken from authService', (done) => {
      const token = 'test-token';
      const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);

      authService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(new HttpResponse({ status: 200 })));

      interceptor.intercept(request, mockHandler).subscribe(() => {
        expect(authService.getToken).toHaveBeenCalled();
        done();
      });
    });

    it('should handle 401 error by removing token', (done) => {
      const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

      authService.getToken.and.returnValue(null);
      mockHandler.handle.and.returnValue(throwError(error));

      interceptor.intercept(request, mockHandler).subscribe(
        () => {},
        (err) => {
          expect(authService.removeToken).toHaveBeenCalled();
          expect(err.status).toBe(401);
          done();
        }
      );
    });

    it('should not remove token for other error statuses', (done) => {
      const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });

      authService.getToken.and.returnValue(null);
      mockHandler.handle.and.returnValue(throwError(error));

      interceptor.intercept(request, mockHandler).subscribe(
        () => {},
        (err) => {
          expect(authService.removeToken).not.toHaveBeenCalled();
          expect(err.status).toBe(500);
          done();
        }
      );
    });

    it('should throw error after handling 401', (done) => {
      const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
      const error = new HttpErrorResponse({ status: 401 });

      authService.getToken.and.returnValue(null);
      mockHandler.handle.and.returnValue(throwError(error));

      interceptor.intercept(request, mockHandler).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(401);
          done();
        }
      );
    });

    it('should preserve token format with Bearer prefix', (done) => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);

      authService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(new HttpResponse({ status: 200 })));

      interceptor.intercept(request, mockHandler).subscribe(() => {
        const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0];
        expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
        done();
      });
    });

    it('should handle POST request with token', (done) => {
      const token = 'test-token';
      const request = new HttpRequest('POST', 'http://localhost:8080/api/students', {});
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);

      authService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(new HttpResponse({ status: 201 })));

      interceptor.intercept(request, mockHandler).subscribe(() => {
        const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0];
        expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
        expect(modifiedRequest.method).toBe('POST');
        done();
      });
    });

    it('should handle PUT request with token', (done) => {
      const token = 'test-token';
      const request = new HttpRequest('PUT', 'http://localhost:8080/api/students/1', {});
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);

      authService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(new HttpResponse({ status: 200 })));

      interceptor.intercept(request, mockHandler).subscribe(() => {
        const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0];
        expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
        expect(modifiedRequest.method).toBe('PUT');
        done();
      });
    });

    it('should handle DELETE request with token', (done) => {
      const token = 'test-token';
      const request = new HttpRequest('DELETE', 'http://localhost:8080/api/students/1');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);

      authService.getToken.and.returnValue(token);
      mockHandler.handle.and.returnValue(of(new HttpResponse({ status: 200 })));

      interceptor.intercept(request, mockHandler).subscribe(() => {
        const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0];
        expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
        expect(modifiedRequest.method).toBe('DELETE');
        done();
      });
    });

    it('should handle empty token string', (done) => {
      const request = new HttpRequest('GET', 'http://localhost:8080/api/test');
      const mockHandler = jasmine.createSpyObj('HttpHandler', ['handle']);

      authService.getToken.and.returnValue('');
      mockHandler.handle.and.returnValue(of(new HttpResponse({ status: 200 })));

      interceptor.intercept(request, mockHandler).subscribe(() => {
        const modifiedRequest = mockHandler.handle.calls.mostRecent().args[0];
        // Empty string is falsy, so Authorization header should not be added
        expect(modifiedRequest.headers.get('Authorization')).toBeNull();
        done();
      });
    });
  });
});



