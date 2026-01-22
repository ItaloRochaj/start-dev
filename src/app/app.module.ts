import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { StudentsComponent } from './students/students.component';
import { NewStudentComponent } from './students/new-student/new-student.component';
import { StudentDetailsComponent } from './students/student-details/student-details.component';
import { EditStudentComponent } from './students/edit-student/edit-student.component';
import { DeleteConfirmationComponent } from './students/delete-confirmation/delete-confirmation.component';
import { ToastComponent } from './components/toast/toast.component';
import { ToastService } from './services/toast.service';
import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    StudentsComponent,
    NewStudentComponent,
    StudentDetailsComponent,
    EditStudentComponent,
    DeleteConfirmationComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    ToastService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
