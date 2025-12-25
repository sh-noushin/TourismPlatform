import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'sf-fileupload',
  imports: [CommonModule],
  templateUrl: './sf-fileupload.component.html',
  styleUrls: ['./sf-fileupload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SfFileuploadComponent {
  readonly accept = input<string>('');
  readonly multiple = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly iconSrc = input<string>('assets/sf-upload-icon.png');

  readonly filesSelected = output<FileList | null>();

  openPicker(fileInput: HTMLInputElement) {
    if (this.disabled()) return;
    fileInput.click();
  }

  onFilesChanged(event: Event) {
    const el = event.target as HTMLInputElement;
    this.filesSelected.emit(el.files);

    el.value = '';
  }
}
