import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'sf-form-field',
  standalone: true,
  templateUrl: './sf-form-field.component.html',
  styleUrl: './sf-form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfFormFieldComponent {
  @Input() label = '';
  @Input() hint?: string;
  @Input() error?: string | null;
  @Input() forId?: string;
}
