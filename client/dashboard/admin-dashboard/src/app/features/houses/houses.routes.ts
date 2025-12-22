import { Routes } from '@angular/router';
import { HousesListComponent } from './pages/list/houses-list.component';
import { HousesEditComponent } from './pages/edit/houses-edit.component';
import { PermissionGuard } from '../../core/auth/permission.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [PermissionGuard],
    data: { permission: 'houses.manage' },
    children: [
      { path: '', component: HousesListComponent },
      { path: 'new', component: HousesEditComponent },
      { path: ':id', component: HousesEditComponent }
    ]
  }
];
