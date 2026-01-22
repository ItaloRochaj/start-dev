import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface StudentOutputDTO {
  id?: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  photo?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsMockService {
  private students: StudentOutputDTO[] = [];
  private nextId = 1;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('mock_students');
    if (stored) {
      this.students = JSON.parse(stored);
      // Calcula o próximo ID
      if (this.students.length > 0) {
        this.nextId = Math.max(...this.students.map(s => s.id || 0)) + 1;
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('mock_students', JSON.stringify(this.students));
  }

  getStudents(): Observable<ApiResponse<StudentOutputDTO[]>> {
    console.log('Mock: Retornando students do localStorage');
    return of({
      data: this.students,
      message: 'Sucesso'
    }).pipe(delay(500)); // Simula latência de rede
  }

  getStudentById(id: number): Observable<ApiResponse<StudentOutputDTO>> {
    const student = this.students.find(s => s.id === id);
    if (student) {
      return of({
        data: student,
        message: 'Sucesso'
      }).pipe(delay(300));
    }
    return throwError({
      status: 404,
      message: 'Aluno não encontrado'
    });
  }

  createStudent(student: any): Observable<ApiResponse<StudentOutputDTO>> {
    console.log('Mock: Criando aluno', student);

    // Valida se CPF já existe
    if (this.students.some(s => s.cpf === student.cpf)) {
      return throwError({
        status: 400,
        error: { message: 'CPF já cadastrado' }
      }).pipe(delay(300));
    }

    // Valida se email já existe
    if (this.students.some(s => s.email === student.email)) {
      return throwError({
        status: 400,
        error: { message: 'Email já cadastrado' }
      }).pipe(delay(300));
    }

    const newStudent: StudentOutputDTO = {
      id: this.nextId++,
      name: student.name,
      cpf: student.cpf,
      email: student.email,
      phone: student.phone,
      photo: student.photo
    };

    this.students.push(newStudent);
    this.saveToStorage();

    console.log('Mock: Aluno criado com sucesso', newStudent);
    return of({
      data: newStudent,
      message: 'Aluno cadastrado com sucesso'
    }).pipe(delay(800)); // Simula latência maior para POST
  }

  updateStudent(id: number, student: any): Observable<ApiResponse<StudentOutputDTO>> {
    console.log('Mock: Atualizando aluno', id, student);

    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError({
        status: 404,
        message: 'Aluno não encontrado'
      }).pipe(delay(300));
    }

    this.students[index] = { ...this.students[index], ...student };
    this.saveToStorage();

    return of({
      data: this.students[index],
      message: 'Aluno atualizado com sucesso'
    }).pipe(delay(700));
  }

  deleteStudent(id: number): Observable<ApiResponse<void>> {
    console.log('Mock: Deletando aluno', id);

    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError({
        status: 404,
        message: 'Aluno não encontrado'
      }).pipe(delay(300));
    }

    this.students.splice(index, 1);
    this.saveToStorage();

    return of({
      data: void 0,
      message: 'Aluno deletado com sucesso'
    }).pipe(delay(600));
  }

  // Limpar todos os dados de teste
  clearAllData(): void {
    this.students = [];
    this.nextId = 1;
    localStorage.removeItem('mock_students');
    console.log('Mock: Todos os dados foram limpos');
  }

  // Adicionar dados de teste
  seedTestData(): void {
    this.students = [
      {
        id: 1,
        name: 'João Silva',
        cpf: '12345678901',
        email: 'joao@example.com',
        phone: '11999999999'
      },
      {
        id: 2,
        name: 'Maria Santos',
        cpf: '98765432100',
        email: 'maria@example.com',
        phone: '21999999999'
      }
    ];
    this.nextId = 3;
    this.saveToStorage();
    console.log('Mock: Dados de teste adicionados');
  }
}
