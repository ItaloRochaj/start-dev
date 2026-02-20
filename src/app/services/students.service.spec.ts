import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
  StudentsService,
  ApiResponse,
  StudentPagedOutputDTO,
  StudentOutputDTO
} from './students.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/students';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentsService]
    });
    service = TestBed.get(StudentsService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getStudents', () => {
    it('should fetch students with default pagination', () => {
      const mockResponse: ApiResponse<StudentPagedOutputDTO> = {
        success: true,
        message: 'Alunos listados',
        data: {
          content: [],
          page: 0,
          size: 4,
          totalElements: 0,
          totalPages: 1,
          first: true,
          last: true
        }
      };

      service.getStudents().subscribe(response => {
        expect(response.data.page).toBe(0);
        expect(response.data.size).toBe(4);
      });

      const req = httpMock.expectOne(req => req.url === apiUrl && req.params.get('page') === '0');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('size')).toBe('4');
      req.flush(mockResponse);
    });

    it('should fetch students with custom pagination', () => {
      const mockResponse: ApiResponse<StudentPagedOutputDTO> = {
        success: true,
        message: 'Alunos listados',
        data: {
          content: [],
          page: 2,
          size: 10,
          totalElements: 45,
          totalPages: 5,
          first: false,
          last: false
        }
      };

      service.getStudents(2, 10).subscribe(response => {
        expect(response.data.page).toBe(2);
        expect(response.data.size).toBe(10);
        expect(response.data.totalElements).toBe(45);
      });

      const req = httpMock.expectOne(req => req.url === apiUrl);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockResponse);
    });

    it('should fetch students with search by name', () => {
      service.getStudents(0, 10, 'João', 'name').subscribe();

      const req = httpMock.expectOne(req => req.url === apiUrl);
      expect(req.request.params.get('search')).toBe('João');
      expect(req.request.params.get('searchType')).toBe('name');
      req.flush({});
    });

    it('should fetch students with search by email', () => {
      service.getStudents(0, 10, 'joao@email.com', 'email').subscribe();

      const req = httpMock.expectOne(req => req.url === apiUrl);
      expect(req.request.params.get('search')).toBe('joao@email.com');
      expect(req.request.params.get('searchType')).toBe('email');
      req.flush({});
    });

    it('should fetch students with search by cpf', () => {
      service.getStudents(0, 10, '12345678901', 'cpf').subscribe();

      const req = httpMock.expectOne(req => req.url === apiUrl);
      expect(req.request.params.get('search')).toBe('12345678901');
      expect(req.request.params.get('searchType')).toBe('cpf');
      req.flush({});
    });

    it('should not include search parameter when not provided', () => {
      service.getStudents(0, 10).subscribe();

      const req = httpMock.expectOne(req => req.url === apiUrl);
      expect(req.request.params.has('search')).toBe(false);
      req.flush({});
    });

    it('should include default searchType when search is provided', () => {
      service.getStudents(0, 10, 'test').subscribe();

      const req = httpMock.expectOne(req => req.url === apiUrl);
      expect(req.request.params.get('searchType')).toBe('name');
      req.flush({});
    });

    it('should return students in content array', (done) => {
      const mockStudents: StudentOutputDTO[] = [
        {
          id: '1',
          name: 'João',
          cpf: '12345678901',
          email: 'joao@email.com',
          phone: '1234567890',
          matricula: 'MAT001'
        }
      ];

      const mockResponse: ApiResponse<StudentPagedOutputDTO> = {
        success: true,
        message: 'Alunos listados',
        data: {
          content: mockStudents,
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true
        }
      };

      service.getStudents().subscribe(response => {
        expect(response.data.content.length).toBe(1);
        expect(response.data.content[0].name).toBe('João');
        done();
      });

      const req = httpMock.expectOne(req => req.url === apiUrl);
      req.flush(mockResponse);
    });

    it('should handle page 0 correctly', () => {
      service.getStudents(0, 4).subscribe();

      const req = httpMock.expectOne(req => req.url === apiUrl);
      expect(req.request.params.get('page')).toBe('0');
      req.flush({});
    });

    it('should handle last page correctly', (done) => {
      const mockResponse: ApiResponse<StudentPagedOutputDTO> = {
        success: true,
        message: 'Alunos listados',
        data: {
          content: [],
          page: 4,
          size: 4,
          totalElements: 20,
          totalPages: 5,
          first: false,
          last: true
        }
      };

      service.getStudents(4, 4).subscribe(response => {
        expect(response.data.last).toBe(true);
        done();
      });

      const req = httpMock.expectOne(req => req.url === apiUrl);
      req.flush(mockResponse);
    });

    it('should handle empty results', (done) => {
      const mockResponse: ApiResponse<StudentPagedOutputDTO> = {
        success: true,
        message: 'Alunos listados',
        data: {
          content: [],
          page: 0,
          size: 4,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true
        }
      };

      service.getStudents().subscribe(response => {
        expect(response.data.content.length).toBe(0);
        expect(response.data.totalElements).toBe(0);
        done();
      });

      const req = httpMock.expectOne(req => req.url === apiUrl);
      req.flush(mockResponse);
    });
  });

  describe('getStudentDetail', () => {
    it('should fetch student detail by id', () => {
      const studentId = '1';
      service.getStudentDetail(studentId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should use correct endpoint with student id', () => {
      const studentId = '123';
      service.getStudentDetail(studentId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      expect(req.request.url).toBe(`${apiUrl}/${studentId}`);
      req.flush({});
    });

    it('should return student details', (done) => {
      const studentId = '1';
      const mockStudent: StudentOutputDTO = {
        id: '1',
        name: 'João Silva',
        cpf: '12345678901',
        email: 'joao@email.com',
        phone: '11987654321',
        matricula: 'MAT001',
        photo: 'url/to/photo',
        status: 'ativo'
      };

      const mockResponse: ApiResponse<StudentOutputDTO> = {
        success: true,
        message: 'Aluno encontrado',
        data: mockStudent
      };

      service.getStudentDetail(studentId).subscribe(response => {
        expect(response.data.name).toBe('João Silva');
        expect(response.data.cpf).toBe('12345678901');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      req.flush(mockResponse);
    });

    it('should handle numeric and string ids', () => {
      const ids = ['1', '123', '999'];

      ids.forEach(id => {
        service.getStudentDetail(id).subscribe();
        const req = httpMock.expectOne(`${apiUrl}/${id}`);
        req.flush({});
      });
    });
  });

  describe('createStudent', () => {
    it('should send POST request to create student', () => {
      const newStudent = {
        name: 'Maria',
        cpf: '98765432100',
        email: 'maria@email.com',
        phone: '11987654321'
      };

      service.createStudent(newStudent).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newStudent);
      req.flush({});
    });

    it('should send all student fields', () => {
      const newStudent = {
        name: 'Maria Silva',
        cpf: '98765432100',
        email: 'maria@email.com',
        phone: '11987654321',
        photo: 'url/to/photo'
      };

      service.createStudent(newStudent).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body.name).toBe('Maria Silva');
      expect(req.request.body.cpf).toBe('98765432100');
      expect(req.request.body.email).toBe('maria@email.com');
      expect(req.request.body.phone).toBe('11987654321');
      req.flush({});
    });

    it('should handle successful student creation', (done) => {
      const newStudent = { name: 'Carlos', cpf: '11122233344', email: 'carlos@email.com', phone: '1199999999' };
      const createdStudent: StudentOutputDTO = {
        id: '1',
        ...newStudent,
        matricula: 'MAT002'
      };

      const mockResponse: ApiResponse<StudentOutputDTO> = {
        success: true,
        message: 'Aluno criado',
        data: createdStudent
      };

      service.createStudent(newStudent).subscribe(response => {
        expect(response.data.id).toBe('1');
        expect(response.data.matricula).toBe('MAT002');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockResponse);
    });

    it('should handle empty student object', () => {
      const emptyStudent = {};
      service.createStudent(emptyStudent).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body).toEqual(emptyStudent);
      req.flush({});
    });
  });

  describe('updateStudent', () => {
    it('should send PUT request to update student', () => {
      const studentId = '1';
      const updatedStudent = { name: 'João Silva' };

      service.updateStudent(studentId, updatedStudent).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedStudent);
      req.flush({});
    });

    it('should use correct endpoint with student id', () => {
      const studentId = '123';
      const updatedStudent = { name: 'Updated Name' };

      service.updateStudent(studentId, updatedStudent).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      expect(req.request.url).toBe(`${apiUrl}/${studentId}`);
      req.flush({});
    });

    it('should update all student fields', () => {
      const studentId = '1';
      const updatedStudent = {
        name: 'João Silva',
        cpf: '12345678901',
        email: 'joao.silva@email.com',
        phone: '11988888888'
      };

      service.updateStudent(studentId, updatedStudent).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      expect(req.request.body).toEqual(updatedStudent);
      req.flush({});
    });

    it('should handle partial updates', () => {
      const studentId = '1';
      const partialUpdate = { name: 'New Name' };

      service.updateStudent(studentId, partialUpdate).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      expect(req.request.body).toEqual(partialUpdate);
      req.flush({});
    });

    it('should return updated student data', (done) => {
      const studentId = '1';
      const updatedData = { name: 'Updated Name' };
      const mockResponse: ApiResponse<StudentOutputDTO> = {
        success: true,
        message: 'Aluno atualizado',
        data: {
          id: '1',
          name: 'Updated Name',
          cpf: '12345678901',
          email: 'joao@email.com',
          phone: '11987654321'
        }
      };

      service.updateStudent(studentId, updatedData).subscribe(response => {
        expect(response.data.name).toBe('Updated Name');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      req.flush(mockResponse);
    });
  });

  describe('deleteStudent', () => {
    it('should send DELETE request to remove student', () => {
      const studentId = '1';
      service.deleteStudent(studentId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should use correct endpoint with student id', () => {
      const studentId = '123';
      service.deleteStudent(studentId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      expect(req.request.url).toBe(`${apiUrl}/${studentId}`);
      req.flush({});
    });

    it('should handle successful deletion', (done) => {
      const studentId = '1';
      const mockResponse: ApiResponse<void> = {
        success: true,
        message: 'Aluno deletado',
        data: undefined
      };

      service.deleteStudent(studentId).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${studentId}`);
      req.flush(mockResponse);
    });

    it('should handle deletion of various student ids', () => {
      const ids = ['1', '123', '999'];

      ids.forEach(id => {
        service.deleteStudent(id).subscribe();
        const req = httpMock.expectOne(`${apiUrl}/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({});
      });
    });
  });

  describe('validateCpfExists', () => {
    it('should check if CPF already exists', () => {
      const cpf = '12345678901';
      service.validateCpfExists(cpf).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/validate/cpf') && req.params.get('cpf') === cpf
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should include CPF parameter in request', () => {
      const cpf = '98765432100';
      service.validateCpfExists(cpf).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/validate/cpf'));
      expect(req.request.params.get('cpf')).toBe(cpf);
      req.flush({});
    });

    it('should return boolean indicating if CPF exists', (done) => {
      const cpf = '12345678901';
      const mockResponse: ApiResponse<boolean> = {
        success: true,
        message: 'CPF validado',
        data: true
      };

      service.validateCpfExists(cpf).subscribe(response => {
        expect(response.data).toBe(true);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/validate/cpf'));
      req.flush(mockResponse);
    });

    it('should return false when CPF does not exist', (done) => {
      const cpf = '11122233344';
      const mockResponse: ApiResponse<boolean> = {
        success: true,
        message: 'CPF disponível',
        data: false
      };

      service.validateCpfExists(cpf).subscribe(response => {
        expect(response.data).toBe(false);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/validate/cpf'));
      req.flush(mockResponse);
    });

    it('should handle various CPF formats', () => {
      const cpfs = ['12345678901', '98765432100', '11122233344'];

      cpfs.forEach(cpf => {
        service.validateCpfExists(cpf).subscribe();
        const req = httpMock.expectOne(req => req.url.includes('/validate/cpf'));
        expect(req.request.params.get('cpf')).toBe(cpf);
        req.flush({});
      });
    });
  });

  describe('validateEmailExists', () => {
    it('should check if email already exists', () => {
      const email = 'joao@email.com';
      service.validateEmailExists(email).subscribe();

      const req = httpMock.expectOne(req =>
        req.url.includes('/validate/email') && req.params.get('email') === email
      );
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should include email parameter in request', () => {
      const email = 'maria@email.com';
      service.validateEmailExists(email).subscribe();

      const req = httpMock.expectOne(req => req.url.includes('/validate/email'));
      expect(req.request.params.get('email')).toBe(email);
      req.flush({});
    });

    it('should return boolean indicating if email exists', (done) => {
      const email = 'joao@email.com';
      const mockResponse: ApiResponse<boolean> = {
        success: true,
        message: 'Email validado',
        data: true
      };

      service.validateEmailExists(email).subscribe(response => {
        expect(response.data).toBe(true);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/validate/email'));
      req.flush(mockResponse);
    });

    it('should return false when email does not exist', (done) => {
      const email = 'newuser@email.com';
      const mockResponse: ApiResponse<boolean> = {
        success: true,
        message: 'Email disponível',
        data: false
      };

      service.validateEmailExists(email).subscribe(response => {
        expect(response.data).toBe(false);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/validate/email'));
      req.flush(mockResponse);
    });

    it('should handle various email formats', () => {
      const emails = [
        'joao@email.com',
        'maria.silva@email.com',
        'user+tag@email.com'
      ];

      emails.forEach(email => {
        service.validateEmailExists(email).subscribe();
        const req = httpMock.expectOne(req => req.url.includes('/validate/email'));
        expect(req.request.params.get('email')).toBe(email);
        req.flush({});
      });
    });
  });

  describe('Error handling', () => {
    it('should handle error when fetching students', () => {
      service.getStudents().subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(req => req.url === apiUrl);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle 404 error when student not found', () => {
      service.getStudentDetail('999').subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(404);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 400 error on invalid input', () => {
      const invalidStudent = {};

      service.createStudent(invalidStudent).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(400);
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle error on update student', () => {
      const student = { id: '1', name: 'Test' };
      service.updateStudent('1', student).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle error on delete student', () => {
      service.deleteStudent('1').subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle error on CPF validation', () => {
      service.validateCpfExists('123.456.789-00').subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(req => req.url.includes('/validate/cpf'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle error on Email validation', () => {
      service.validateEmailExists('test@email.com').subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(500);
        }
      );

      const req = httpMock.expectOne(req => req.url.includes('/validate/email'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });
});



