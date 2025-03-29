// user-dialog/user-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../../models/user';
import { AbstractControl, ValidationErrors } from '@angular/forms';
@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
})
export class UserDialogComponent {
  userForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { user: User | null; jobTitles: any[] }
  ) {
    this.isEditMode = !!data.user;
    this.dialogTitle = this.isEditMode ? 'Edit User' : 'Add New User';

    this.userForm = this.fb.group({
      firstName: [data.user?.firstName || '', [Validators.required]],
      lastName: [data.user?.lastName || '', [Validators.required]],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      username: [data.user?.username || '', [Validators.required]],
      jobTitleId: [data.user?.jobTitleID || '', [Validators.required]],
      telephoneNo: [
        data.user?.telephoneNo || '',
        [Validators.pattern(/^\d+$/)],
      ],
      specialist: [data.user?.specialist || ''],
      availability: [data.user?.availability || ''],
    });

    // Add password fields only for new users
    if (!this.isEditMode) {
      this.userForm.addControl(
        'password',
        this.fb.control('', [Validators.required, Validators.minLength(8)])
      );
      this.userForm.addControl(
        'confirmPassword',
        this.fb.control('', [Validators.required])
      );
      this.userForm.setValidators(this.passwordMatchValidator);
    }
  }

  // Corrected password match validator
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    if (!(form instanceof FormGroup)) {
      return null;
    }

    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    const userData = this.userForm.value;

    // Add the user ID if in edit mode
    if (this.isEditMode && this.data.user) {
      userData.userID = this.data.user.userID;
    }

    this.dialogRef.close({
      action: this.isEditMode ? 'edit' : 'add',
      user: userData,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);

    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
    }

    if (control.hasError('pattern')) {
      return 'Please enter a valid number';
    }

    if (control.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return '';
  }
}
