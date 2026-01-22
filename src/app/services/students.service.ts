import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

export interface StudentOutputDTO {
  id: string | number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPagedOutputDTO {
  content: StudentOutputDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private apiUrl = 'http://localhost:8080/api/students';
  public useMock = false; // Altere para true para usar mock local
  private mockStudents: StudentOutputDTO[] = [];
  private nextMockId = 1;

  constructor(private http: HttpClient) {
    this.loadMockDataFromStorage();
    // Ativar mock automaticamente se houver dados no localStorage
    this.checkAndEnableMockMode();
  }

  private checkAndEnableMockMode(): void {
    const hasMockData = localStorage.getItem('mock_students_list');
    const mockModeEnabled = localStorage.getItem('mock_mode_enabled');
    if (hasMockData || mockModeEnabled === 'true') {
      this.useMock = true;
      console.log('✓ Modo Mock automaticamente ativado (dados encontrados no localStorage)');
    }
  }

  private loadMockDataFromStorage(): void {
    const stored = localStorage.getItem('mock_students_list');
    if (stored) {
      this.mockStudents = JSON.parse(stored);
      if (this.mockStudents.length > 0) {
        this.nextMockId = Math.max(...this.mockStudents.map(s => {
          const id = typeof s.id === 'string' ? parseInt(s.id, 10) : s.id;
          return isNaN(id) ? 0 : id;
        })) + 1;
      }
    }
  }

  private saveMockDataToStorage(): void {
    localStorage.setItem('mock_students_list', JSON.stringify(this.mockStudents));
  }

  // Ativa/Desativa modo mock
  setMockMode(enabled: boolean): void {
    this.useMock = enabled;
    localStorage.setItem('mock_mode_enabled', enabled ? 'true' : 'false');
    console.log(`Modo Mock: ${enabled ? 'ATIVADO ✓' : 'DESATIVADO ✗'}`);
  }

  isMockEnabled(): boolean {
    return this.useMock;
  }

  // Limpar dados mock
  clearMockData(): void {
    this.mockStudents = [];
    this.nextMockId = 1;
    localStorage.removeItem('mock_students_list');
  }

  // Dados de teste
  seedMockTestData(): void {
    this.mockStudents = [
      {
        id: 1,
        name: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        phone: '11999999999',
        photo: 'assets/default-avatar.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Maria Santos',
        cpf: '98765432100',
        email: 'maria@example.com',
        phone: '21999999999',
        photo: 'assets/default-avatar.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.nextMockId = 3;
    this.saveMockDataToStorage();
    console.log('Dados de teste adicionados ao mock');
  }

  getStudents(
    page: number = 0,
    size: number = 10,
    search?: string,
    searchType: string = 'name'
  ): Observable<ApiResponse<StudentPagedOutputDTO>> {
    if (this.useMock) {
      return this.getMockStudents(page, size, search, searchType);
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('searchType', searchType);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<StudentPagedOutputDTO>>(this.apiUrl, { params })
      .pipe(catchError(err => {
        console.error('Erro ao buscar estudantes:', err);
        return throwError(err);
      }));
  }

  private getMockStudents(
    page: number = 0,
    size: number = 10,
    search?: string,
    searchType: string = 'name'
  ): Observable<ApiResponse<StudentPagedOutputDTO>> {
    console.log('Mock: Buscando students com filtro:', { page, size, search, searchType });

    let filtered = this.mockStudents;

    if (search && searchType === 'name') {
      filtered = this.mockStudents.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    } else if (search && searchType === 'cpf') {
      filtered = this.mockStudents.filter(s =>
        s.cpf.includes(search.replace(/\D/g, ''))
      );
    } else if (search && searchType === 'email') {
      filtered = this.mockStudents.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const totalElements = filtered.length;
    const start = page * size;
    const end = start + size;
    const content = filtered.slice(start, end);

    const response: ApiResponse<StudentPagedOutputDTO> = {
      success: true,
      message: 'Estudantes recuperados com sucesso',
      data: {
        content,
        page,
        size,
        totalElements,
        totalPages: Math.ceil(totalElements / size),
        first: page === 0,
        last: page >= Math.ceil(totalElements / size) - 1
      }
    };

    return of(response).pipe(delay(300));
  }

  getStudentDetail(id: string): Observable<ApiResponse<StudentOutputDTO>> {
    if (this.useMock) {
      return this.getMockStudentDetail(id);
    }

    return this.http.get<ApiResponse<StudentOutputDTO>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(err => {
        console.error('Erro ao buscar estudante:', err);
        return throwError(err);
      }));
  }

  private getMockStudentDetail(id: string): Observable<ApiResponse<StudentOutputDTO>> {
    console.log('🔍 Mock: Buscando estudante com ID:', id);
    console.log('📊 Estudantes disponíveis:', this.mockStudents.map(s => ({ id: s.id, name: s.name })));

    const student = this.mockStudents.find(s => String(s.id) === String(id));

    if (!student) {
      console.warn('⚠️ Mock: Estudante não encontrado com ID:', id);
      return throwError({
        success: false,
        message: 'Estudante não encontrado',
        status: 404
      }).pipe(delay(200));
    }

    console.log('✅ Mock: Estudante encontrado:', student);
    return of({
      success: true,
      message: 'Estudante recuperado com sucesso',
      data: student
    }).pipe(delay(200));
  }

  createStudent(student: any): Observable<ApiResponse<StudentOutputDTO>> {
    if (this.useMock) {
      return this.createMockStudent(student);
    }

    return this.http.post<ApiResponse<StudentOutputDTO>>(this.apiUrl, student)
      .pipe(catchError(err => {
        console.error('Erro ao criar estudante:', err);
        return throwError(err);
      }));
  }

  private createMockStudent(student: any): Observable<ApiResponse<StudentOutputDTO>> {
    console.log('Mock: Criando estudante', student);

    // Valida CPF duplicado
    if (this.mockStudents.some(s => s.cpf === student.cpf)) {
      return throwError({
        success: false,
        message: 'CPF já cadastrado',
        status: 400,
        error: { message: 'CPF já cadastrado' }
      }).pipe(delay(300));
    }

    // Valida email duplicado
    if (this.mockStudents.some(s => s.email === student.email)) {
      return throwError({
        success: false,
        message: 'Email já cadastrado',
        status: 400,
        error: { message: 'Email já cadastrado' }
      }).pipe(delay(300));
    }

    const newStudent: StudentOutputDTO = {
      id: this.nextMockId++,
      name: student.name,
      cpf: student.cpf,
      email: student.email,
      phone: student.phone,
      photo: student.photo || 'assets/default-avatar.svg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.mockStudents.push(newStudent);
    this.saveMockDataToStorage();

    console.log('Mock: Estudante criado com sucesso', newStudent);
    return of({
      success: true,
      message: 'Estudante criado com sucesso',
      data: newStudent
    }).pipe(delay(800));
  }

  updateStudent(id: string, student: any): Observable<ApiResponse<StudentOutputDTO>> {
    if (this.useMock) {
      return this.updateMockStudent(id, student);
    }

    return this.http.put<ApiResponse<StudentOutputDTO>>(`${this.apiUrl}/${id}`, student)
      .pipe(catchError(err => {
        console.error('Erro ao atualizar estudante:', err);
        return throwError(err);
      }));
  }

  private updateMockStudent(id: string, student: any): Observable<ApiResponse<StudentOutputDTO>> {
    console.log('Mock: Atualizando estudante', id, student);

    const index = this.mockStudents.findIndex(s => String(s.id) === id);
    if (index === -1) {
      return throwError({
        success: false,
        message: 'Estudante não encontrado',
        status: 404
      }).pipe(delay(200));
    }

    this.mockStudents[index] = {
      ...this.mockStudents[index],
      ...student,
      updatedAt: new Date().toISOString()
    };
    this.saveMockDataToStorage();

    return of({
      success: true,
      message: 'Estudante atualizado com sucesso',
      data: this.mockStudents[index]
    }).pipe(delay(700));
  }

  deleteStudent(id: string): Observable<ApiResponse<void>> {
    if (this.useMock) {
      return this.deleteMockStudent(id);
    }

    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(err => {
        console.error('Erro ao deletar estudante:', err);
        return throwError(err);
      }));
  }

  private deleteMockStudent(id: string): Observable<ApiResponse<void>> {
    console.log('Mock: Deletando estudante', id);

    const index = this.mockStudents.findIndex(s => String(s.id) === id);
    if (index === -1) {
      return throwError({
        success: false,
        message: 'Estudante não encontrado',
        status: 404
      }).pipe(delay(200));
    }

    this.mockStudents.splice(index, 1);
    this.saveMockDataToStorage();

    return of({
      success: true,
      message: 'Estudante deletado com sucesso',
      data: void 0
    }).pipe(delay(600));
  }
}
