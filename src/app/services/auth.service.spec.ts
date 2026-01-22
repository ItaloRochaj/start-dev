import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null when no token is stored', () => {
    localStorage.clear();
    expect(service.getToken()).toBeNull();
  });

  it('should store and retrieve token', () => {
    const testToken = 'test-token-123';
    service.setToken(testToken);
    expect(service.getToken()).toBe(testToken);
  });

  it('should remove token', () => {
    service.setToken('test-token');
    service.removeToken();
    expect(service.getToken()).toBeNull();
  });

  it('should return false when not authenticated', () => {
    localStorage.clear();
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should return true when authenticated', () => {
    service.setToken('test-token');
    expect(service.isAuthenticated()).toBeTruthy();
  });

  afterEach(() => {
    localStorage.clear();
  });
});
