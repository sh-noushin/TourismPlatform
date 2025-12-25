import { ChangeDetectionStrategy, Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TourScheduleItem {
  id?: string;
  startAtUtc: string;
  endAtUtc: string;
  capacity: number;
  isNew?: boolean;
}

@Component({
  standalone: true,
  selector: 'sf-tour-schedule',
  templateUrl: './sf-tour-schedule.component.html',
  styleUrls: ['./sf-tour-schedule.component.scss'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SfTourScheduleComponent {
  readonly schedules = input<TourScheduleItem[]>([]);
  readonly disabled = input<boolean>(false);
  readonly label = input<string>('Schedules');

  readonly schedulesChange = output<TourScheduleItem[]>();
  readonly scheduleDeleted = output<TourScheduleItem>();

  readonly showAddForm = signal(false);
  readonly newSchedule = signal<Partial<TourScheduleItem>>({
    startAtUtc: '',
    endAtUtc: '',
    capacity: 10
  });

  readonly sortedSchedules = computed(() =>
    [...this.schedules()].sort(
      (a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime()
    )
  );

  toggleAddForm() {
    this.showAddForm.update((v) => !v);
    if (this.showAddForm()) {
      this.resetNewSchedule();
    }
  }

  resetNewSchedule() {
    this.newSchedule.set({
      startAtUtc: '',
      endAtUtc: '',
      capacity: 10
    });
  }

  addSchedule() {
    const schedule = this.newSchedule();
    if (!schedule.startAtUtc || !schedule.endAtUtc || !schedule.capacity) {
      return;
    }

    if (new Date(schedule.endAtUtc) <= new Date(schedule.startAtUtc)) {
      return;
    }

    const newItem: TourScheduleItem = {
      startAtUtc: schedule.startAtUtc,
      endAtUtc: schedule.endAtUtc,
      capacity: schedule.capacity,
      isNew: true
    };

    const updated = [...this.schedules(), newItem];
    this.schedulesChange.emit(updated);
    this.showAddForm.set(false);
    this.resetNewSchedule();
  }

  removeSchedule(index: number) {
    const current = this.schedules();
    const removed = current[index];
    const updated = current.filter((_, i) => i !== index);
    this.schedulesChange.emit(updated);

    if (removed && !removed.isNew) {
      this.scheduleDeleted.emit(removed);
    }
  }

  updateNewScheduleField<K extends keyof TourScheduleItem>(key: K, value: TourScheduleItem[K]) {
    this.newSchedule.update((current) => ({ ...current, [key]: value }));
  }

  formatDateTime(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackSchedule = (index: number, item: TourScheduleItem) =>
    item.id ?? `new-${index}-${item.startAtUtc}`;
}
