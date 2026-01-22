import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudentsService, ApiResponse, StudentPagedOutputDTO } from './students.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/students';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentsService]
    });
    service = TestBed.inject(StudentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch students with default pagination', () => {
    const mockResponse: ApiResponse<StudentPagedOutputDTO> = {
      success: true,
      message: 'Alunos listados',
      data: {
        content: [],
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 1,
        first: true,
        last: true
      }
    };

    service.getStudents().subscribe(response => {
      expect(response.data.page).toBe(0);
      expect(response.data.size).toBe(10);
    });

    const req = httpMock.expectOne(req => req.url === apiUrl && req.params.get('page') === '0');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch students with custom pagination', () => {
    const mockResponse: ApiResponse<StudentPagedOutputDTO> = {
      success: true,
      message: 'Alunos listados',
      data: {
        content: [],
        page: 1,
        size: 20,
        totalElements: 0,
        totalPages: 1,
        first: false,
        last: true
      }
    };

    service.getStudents(1, 20).subscribe(response => {
      expect(response.data.page).toBe(1);
      expect(response.data.size).toBe(20);
    });

    const req = httpMock.expectOne(req => req.url === apiUrl);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('20');
    req.flush(mockResponse);
  });

  it('should fetch students with search', () => {
    service.getStudents(0, 10, 'João', 'name').subscribe();

    const req = httpMock.expectOne(req => req.url === apiUrl);
    expect(req.request.params.get('search')).toBe('João');
    expect(req.request.params.get('searchType')).toBe('name');
    req.flush({});
  });

  it('should fetch student detail', () => {
    const studentId = '123';
    service.getStudentDetail(studentId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should create student', () => {
    const newStudent = { name: 'João', cpf: '123456789', email: 'joao@example.com' };
    service.createStudent(newStudent).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newStudent);
    req.flush({});
  });

  it('should update student', () => {
    const studentId = '123';
    const updatedStudent = { name: 'João Silva' };
    service.updateStudent(studentId, updatedStudent).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedStudent);
    req.flush({});
  });

  it('should delete student', () => {
    const studentId = '123';
    service.deleteStudent(studentId).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
