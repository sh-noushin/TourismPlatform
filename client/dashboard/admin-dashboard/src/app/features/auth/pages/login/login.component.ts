import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { SfButtonComponent } from '../../../../shared/ui/sf-button/sf-button.component';
import { SfFormFieldComponent } from '../../../../shared/ui/sf-form-field/sf-form-field.component';
import { AuthFacade } from '../../../../core/auth/auth.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, SfButtonComponent, SfFormFieldComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit() {
    this.error.set(null);
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/admin');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid email or password');
      }
    });
  }
}
