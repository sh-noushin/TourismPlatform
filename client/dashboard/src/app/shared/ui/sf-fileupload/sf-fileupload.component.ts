import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SfButtonComponent } from '../sf-button/sf-button.component';

@Component({
  standalone: true,
  selector: 'sf-fileupload',
  imports: [CommonModule, SfButtonComponent],
  templateUrl: './sf-fileupload.component.html',
  styleUrls: ['./sf-fileupload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfFileuploadComponent {
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly statusText = input<string>('');
  readonly buttonText = input<string>('Choose files');
  readonly accept = input<string>('');
  readonly multiple = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly buttonColor = input<string>('#4f46e5');
  readonly buttonTextColor = input<string>('#ffffff');

  readonly filesSelected = output<FileList | null>();

  handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filesSelected.emit(input.files);
    input.value = '';
  }
}
