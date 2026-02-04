import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface StudentOutputDTO {
  id: string | number;
  matricula?: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  photo?: string;
  status?: string;
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

  constructor(private http: HttpClient) { }

  getStudents(
    page: number = 0,
    size: number = 4,
    search?: string,
    searchType: string = 'name'
  ): Observable<ApiResponse<StudentPagedOutputDTO>> {
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

  getStudentDetail(id: string): Observable<ApiResponse<StudentOutputDTO>> {
    return this.http.get<ApiResponse<StudentOutputDTO>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(err => {
        console.error('Erro ao buscar estudante:', err);
        return throwError(err);
      }));
  }

  createStudent(student: any): Observable<ApiResponse<StudentOutputDTO>> {
    return this.http.post<ApiResponse<StudentOutputDTO>>(this.apiUrl, student)
      .pipe(catchError(err => {
        console.error('Erro ao criar estudante:', err);
        return throwError(err);
      }));
  }

  updateStudent(id: string, student: any): Observable<ApiResponse<StudentOutputDTO>> {
    return this.http.put<ApiResponse<StudentOutputDTO>>(`${this.apiUrl}/${id}`, student)
      .pipe(catchError(err => {
        console.error('Erro ao atualizar estudante:', err);
        return throwError(err);
      }));
  }

  deleteStudent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(catchError(err => {
        console.error('Erro ao deletar estudante:', err);
        return throwError(err);
      }));
  }

  validateCpfExists(cpf: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/validate/cpf`, {
      params: { cpf }
    }).pipe(catchError(err => {
      console.error('Erro ao validar CPF:', err);
      return throwError(err);
    }));
  }

  validateEmailExists(email: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/validate/email`, {
      params: { email }
    }).pipe(catchError(err => {
      console.error('Erro ao validar Email:', err);
      return throwError(err);
    }));
  }
}
