import { Component, Injectable } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmailService } from '../services/email.service';
import { SignupModel } from '../models/signup.model';
import { AuthService } from '../services/auth.service';
import { AppComponent } from '../app.component';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  signupForm: FormGroup;
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  emailFromLanding: string = '';
  showSignupForm: boolean = true;

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService,
    private as: AuthService,
    private app: AppComponent
  ) {
    this.emailFromLanding = this.emailService.email;
    this.signupForm = this.fb.group({
      email: [this.emailFromLanding, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.emailService.email = '';
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  async onSubmit() {
    try {
      let newUser = new SignupModel(
        this.signupForm.value.username,
        this.signupForm.value.email,
        this.signupForm.value.password
      );
      await lastValueFrom(this.as.signUPWithEmailAndPassword(newUser));
      this.app.showDialog('Signup Successful');
      this.showSignupForm = false;
    } catch (error) {
      this.app.showDialog('Signup Failed');
    }
  }
}
