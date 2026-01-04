import { Component, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'change-password-dialog',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, MatDialogModule],
  templateUrl: './change-password-page.component.html',
  styleUrls: ['./change-password-page.component.scss']
})
export class ChangePasswordPageComponent {
  readonly passwordPattern = /(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/;
  readonly form: FormGroup;

  busy = false;
  feedback: { type: 'success' | 'error'; message: string } | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly translate: TranslateService,
    @Optional() private readonly dialogRef?: MatDialogRef<ChangePasswordPageComponent>
  ) {
    this.form = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(this.passwordPattern)]],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: this.matchPasswords
      }
    );
  }

  get currentPassword(): AbstractControl {
    return this.form.get('currentPassword') as AbstractControl;
  }

  get newPassword(): AbstractControl {
    return this.form.get('newPassword') as AbstractControl;
  }

  get confirmPassword(): AbstractControl {
    return this.form.get('confirmPassword') as AbstractControl;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.busy = true;
    this.feedback = null;

    try {
      await this.simulatePasswordChange();
      this.feedback = {
        type: 'success',
        message: this.translate.instant('CHANGE_PASSWORD_PAGE.SUCCESS')
      };
      this.form.reset();
    } catch (error) {
      this.feedback = {
        type: 'error',
        message: this.translate.instant('CHANGE_PASSWORD_PAGE.ERROR_PATTERN')
      };
    } finally {
      this.busy = false;
    }
  }

  close() {
    void this.dialogRef?.close();
  }

  private matchPasswords(control: AbstractControl) {
    const newPass = control.get('newPassword');
    const confirmPass = control.get('confirmPassword');
    if (!newPass || !confirmPass) return null;
    return newPass.value === confirmPass.value ? null : { passwordMismatch: true };
  };

  private simulatePasswordChange(): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), 650));
  }
}
