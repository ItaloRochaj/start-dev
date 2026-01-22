import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentOutputDTO {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
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
  private apiUrl = 'http://localhost:8080/api/students'; // TODO: Ajustar URL do backend

  constructor(private http: HttpClient) {}

  getStudents(
    page: number = 0,
    size: number = 10,
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

    return this.http.get<ApiResponse<StudentPagedOutputDTO>>(this.apiUrl, { params });
  }

  getStudentDetail(id: string): Observable<ApiResponse<StudentOutputDTO>> {
    return this.http.get<ApiResponse<StudentOutputDTO>>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: any): Observable<ApiResponse<StudentOutputDTO>> {
    return this.http.post<ApiResponse<StudentOutputDTO>>(this.apiUrl, student);
  }

  updateStudent(id: string, student: any): Observable<ApiResponse<StudentOutputDTO>> {
    return this.http.put<ApiResponse<StudentOutputDTO>>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
