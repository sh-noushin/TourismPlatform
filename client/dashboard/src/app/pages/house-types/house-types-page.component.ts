import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HouseTypesService } from '../../features/houses/house-types.service';

@Component({
  standalone: true,
  selector: 'house-types-page',
  imports: [CommonModule],
  templateUrl: './house-types-page.component.html',
  styleUrls: ['./house-types-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HouseTypesPageComponent {
  readonly loading = computed(() => this.houseTypesService.loading());
  readonly error = computed(() => this.houseTypesService.error());
  readonly types = computed(() => this.houseTypesService.houseTypes());

  constructor(private readonly houseTypesService: HouseTypesService) {
    void this.houseTypesService.load();
  }
}
