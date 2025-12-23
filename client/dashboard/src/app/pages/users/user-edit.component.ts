import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SfButtonComponent } from '../../shared/ui/sf-button/sf-button.component';
import { SfCardComponent } from '../../shared/ui/sf-card/sf-card.component';
import { SfSpinnerComponent } from '../../shared/ui/sf-spinner/sf-spinner.component';
import { UsersFacade, UserDetailDto } from '../../features/users/users.facade';

const USER_FORM_DEFAULT = { email: '', displayName: '' };

@Component({
  standalone: true,
  selector: 'user-edit',
  imports: [CommonModule, SfCardComponent, SfButtonComponent, SfSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="user-edit">
      <sf-card>
        <header class="user-edit__header">
          <h3>
            @if (isEditMode()) {
              <span>Edit user</span>
            } @else {
              <span>Create user</span>
            }
          </h3>
        </header>

        @if (loading()) {
          <sf-spinner></sf-spinner>
        } @else {
          <form class="user-edit__form" (submit)="onSave($event)">
            <label>
              Display name
              <input
                type="text"
                [value]="displayName()"
                (input)="displayName.set($any($event.target).value)"
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                [value]="email()"
                (input)="email.set($any($event.target).value)"
                required
              />
            </label>
            <div class="user-edit__actions">
              <sf-button variant="ghost" buttonType="button" (click)="resetToDefaults()" [disabled]="saving()">Reset</sf-button>
              <sf-button variant="primary" [loading]="saving()" buttonType="submit">{{ isEditMode() ? 'Update' : 'Create' }}</sf-button>
            </div>
          </form>
          @if (error()) {
            <p class="user-edit__message user-edit__message--error">{{ error() }}</p>
          }
          @if (saved()) {
            <p class="user-edit__message user-edit__message--success">Saved.</p>
          }
        }
      </sf-card>
    </section>
  `
})
export class UserEditComponent {
  readonly email = signal('');
  readonly displayName = signal('');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);
  readonly userId = signal<string | null>(null);
  readonly isEditMode = computed(() => this.userId() !== null);
  private readonly original = signal<UserDetailDto | null>(null);

  constructor(private readonly route: ActivatedRoute, private readonly users: UsersFacade) {
    this.userId.set(this.route.snapshot.paramMap.get('id'));
    this.initialize();
  }

  private async initialize() {
    if (!this.userId()) {
      this.applyDefaults();
      return;
    }
    this.loading.set(true);
    try {
      const user = await this.users.get(this.userId()!);
      this.original.set(user ?? null);
      this.displayName.set(user?.displayName ?? user?.fullName ?? '');
      this.email.set(user?.email ?? '');
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed loading user');
    } finally {
      this.loading.set(false);
    }
  }

  private applyDefaults() {
    this.original.set(null);
    this.displayName.set(USER_FORM_DEFAULT.displayName);
    this.email.set(USER_FORM_DEFAULT.email);
  }

  resetToDefaults() {
    const original = this.original();
    if (original) {
      this.displayName.set(original.displayName ?? original.fullName ?? '');
      this.email.set(original.email);
    } else {
      this.applyDefaults();
    }
    this.saved.set(false);
    this.error.set(null);
  }

  async onSave(event: Event) {
    event.preventDefault();
    this.saving.set(true);
    this.saved.set(false);
    this.error.set(null);
    try {
      await this.users.save(this.userId(), {
        email: this.email(),
        displayName: this.displayName()
      });
      this.saved.set(true);
    } catch (err: any) {
      this.error.set(err?.message ?? 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

}
