import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';

import { StudentsComponent } from './students.component';
import { StudentsService } from '../services/students.service';

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;
  let service: StudentsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StudentsComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [StudentsService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(StudentsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    spyOn(component, 'loadStudents');
    component.ngOnInit();
    expect(component.loadStudents).toHaveBeenCalled();
  });

  it('should handle search with name', () => {
    component.searchForm.patchValue({ search: 'João' });
    component.onSearch();
    expect(component.searchTerm).toBe('João');
    expect(component.searchType).toBe('name');
  });

  it('should handle search with numeric matrícula', () => {
    component.searchForm.patchValue({ search: '2024020' });
    component.onSearch();
    expect(component.searchTerm).toBe('2024020');
    expect(component.searchType).toBe('cpf');
  });

  it('should clear search', () => {
    component.searchForm.patchValue({ search: 'test' });
    component.clearSearch();
    expect(component.searchForm.get('search')?.value).toBeNull();
    expect(component.searchTerm).toBe('');
  });

  it('should generate page numbers correctly', () => {
    component.totalPages = 10;
    component.currentPage = 5;
    const pages = component.getPageNumbers();
    expect(pages.length).toBeLessThanOrEqual(5);
    expect(pages).toContain(5);
  });

  it('should navigate to page', () => {
    spyOn(component, 'loadStudents');
    component.totalPages = 5;
    component.goToPage(2);
    expect(component.loadStudents).toHaveBeenCalledWith(2);
  });

  it('should not navigate to invalid page', () => {
    spyOn(component, 'loadStudents');
    component.totalPages = 5;
    component.goToPage(10);
    expect(component.loadStudents).not.toHaveBeenCalled();
  });

  it('should navigate to next page', () => {
    spyOn(component, 'loadStudents');
    component.currentPage = 2;
    component.totalPages = 5;
    component.goToNextPage();
    expect(component.loadStudents).toHaveBeenCalledWith(3);
  });

  it('should not navigate to next page if on last page', () => {
    spyOn(component, 'loadStudents');
    component.currentPage = 4;
    component.totalPages = 5;
    component.goToNextPage();
    expect(component.loadStudents).not.toHaveBeenCalled();
  });

  it('should navigate to previous page', () => {
    spyOn(component, 'loadStudents');
    component.currentPage = 2;
    component.goToPreviousPage();
    expect(component.loadStudents).toHaveBeenCalledWith(1);
  });

  it('should not navigate to previous page if on first page', () => {
    spyOn(component, 'loadStudents');
    component.currentPage = 0;
    component.goToPreviousPage();
    expect(component.loadStudents).not.toHaveBeenCalled();
  });
});
