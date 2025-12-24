import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SfButtonComponent } from '../shared/ui/sf-button/sf-button.component';
import { SfTabsComponent } from '../shared/ui/sf-tabs/sf-tabs.component';
import { HasPermissionDirective } from '../shared/directives/has-permission.directive';
import { TabService } from '../core/tab/tab.service';
import { AuthFacade } from '../core/auth/auth.facade';
import { UserMenuComponent } from '../shared/ui/user-menu/user-menu.component';
import { ToastService } from '../shared/ui/toast/toast.service';
import { HousesFacade } from '../features/houses/houses.facade';
import { ToursFacade } from '../features/tours/tours.facade';
import { ExchangeFacade } from '../features/exchange/exchange.facade';
import { PermissionsFacade } from '../features/permissions/permissions.facade';
import { CreateExchangeOrderRequest } from '../api/client';

type QuickFormType = 'house' | 'tour' | 'exchange' | 'permission';

interface HouseFormData {
  name: string;
  description: string;
  houseTypeName: string;
  city: string;
  country: string;
}

interface TourFormData {
  name: string;
  description: string;
  category: string;
}

interface ExchangeFormData {
  baseCurrency: string;
  quoteCurrency: string;
  amount: string;
}

interface PermissionFormData {
  code: string;
  description: string;
  enabled: boolean;
}

interface ModuleCard {
  label: string;
  description: string;
  path: string;
  permission: string;
  formType: QuickFormType;
  subItems?: string[];
}

@Component({
  standalone: true,
  selector: 'dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    SfButtonComponent,
    SfTabsComponent,
    HasPermissionDirective,
    UserMenuComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardShellComponent {
  readonly displayName = computed(() => this.auth.userEmail() ?? 'Super Admin');
  readonly roleLabel = computed(() => {
    if (this.auth.isSuperUser()) return 'Super Admin';
    const roles = Array.from(this.auth.roles());
    return roles[0] ?? 'Operator';
  });
  readonly userInitials = computed(() => {
    const email = this.auth.userEmail();
    if (!email) return 'SA';
    const handle = email.split('@')[0] ?? email;
    const parts = handle.split(/[\.\-\_\s]+/).filter(Boolean);
    const letters = parts.map(p => p[0]).join('').slice(0, 2);
    return (letters || handle.slice(0, 2)).toUpperCase();
  });
  readonly operations = [
    { label: 'Houses', path: '/admin/houses', permission: 'Houses.View', hint: 'Listings & owners' },
    { label: 'Tours', path: '/admin/tours', permission: 'Tours.View', hint: 'Experiences & schedules' },
    { label: 'Exchanges', path: '/admin/exchange', permission: 'Exchange.View', hint: 'Currency & orders' }
  ];
  readonly accessControls = [
    { label: 'Users', path: '/admin/users', permission: 'Users.Manage', hint: 'Accounts & roles' },
    { label: 'Permissions', path: '/admin/permissions', permission: 'Users.Manage', hint: 'Roles & permissions' },
    { label: 'Claims', path: '/admin/claims', permission: 'Users.Manage', hint: 'Claims registry' }
  ];

  readonly modules: ModuleCard[] = [
    { label: 'Houses', description: 'Active properties on the platform', path: '/admin/houses', permission: 'Houses.View', formType: 'house' },
    { label: 'Tours', description: 'Scheduled tours and experiences', path: '/admin/tours', permission: 'Tours.View', formType: 'tour' },
    { label: 'Exchanges', description: 'Currency rates and pending orders', path: '/admin/exchange', permission: 'Exchange.View', formType: 'exchange' },
    {
      label: 'Permissions',
      description: 'Roles, claims, and access control',
      path: '/admin/permissions',
      permission: 'Users.Manage',
      formType: 'permission',
      subItems: ['Roles', 'Claims']
    }
  ];

  readonly quickFormType = signal<QuickFormType | null>(null);
  readonly quickFormLoading = signal(false);
  readonly quickFormError = signal<string | null>(null);

  readonly expandedSection = signal<string | null>(null);

  readonly houseForm = signal<HouseFormData>({ name: '', description: '', houseTypeName: '', city: '', country: '' });
  readonly tourForm = signal<TourFormData>({ name: '', description: '', category: '' });
  readonly exchangeForm = signal<ExchangeFormData>({ baseCurrency: 'USD', quoteCurrency: 'EUR', amount: '' });
  readonly permissionForm = signal<PermissionFormData>({ code: '', description: '', enabled: true });

  readonly quickFormHeading = computed(() => {
    const type = this.quickFormType();
    if (!type) return '';
    switch (type) {
      case 'house':
        return 'Add a new house';
      case 'tour':
        return 'Add a new tour';
      case 'exchange':
        return 'Create an exchange order';
      case 'permission':
        return 'Create a permission';
    }
  });

  constructor(
    public readonly auth: AuthFacade,
    private readonly houses: HousesFacade,
    private readonly tours: ToursFacade,
    private readonly exchange: ExchangeFacade,
    private readonly permissions: PermissionsFacade,
    private readonly tabs: TabService,
    private readonly router: Router,
    private readonly toast: ToastService
  ) {}

  openNav(path: string, title: string) {
    const fullPath = this.ensureAdminPath(path);
    this.tabs.openOrActivate(fullPath, title);
    void this.router.navigateByUrl(fullPath);
  }

  openQuickForm(type: QuickFormType) {
    this.quickFormError.set(null);
    this.quickFormType.set(type);
    this.resetQuickForm();
  }

  closeQuickForm() {
    this.quickFormType.set(null);
    this.quickFormError.set(null);
  }

  private ensureAdminPath(path: string) {
    return path.startsWith('/admin') ? path : `/admin/${path}`;
  }

  private resetQuickForm() {
    this.houseForm.set({ name: '', description: '', houseTypeName: '', city: '', country: '' });
    this.tourForm.set({ name: '', description: '', category: '' });
    this.exchangeForm.set({ baseCurrency: 'USD', quoteCurrency: 'EUR', amount: '' });
    this.permissionForm.set({ code: '', description: '', enabled: true });
  }

  updateHouseField(field: keyof HouseFormData, value: string) {
    this.houseForm.update((current) => ({ ...current, [field]: value }));
  }

  updateTourField(field: keyof TourFormData, value: string) {
    this.tourForm.update((current) => ({ ...current, [field]: value }));
  }

  updateExchangeField(field: keyof ExchangeFormData, value: string) {
    this.exchangeForm.update((current) => ({ ...current, [field]: value }));
  }

  updatePermissionField(field: keyof PermissionFormData, value: string | boolean) {
    this.permissionForm.update((current) => ({ ...current, [field]: value as any }));
  }

  async submitQuickForm() {
    const type = this.quickFormType();
    if (!type) return;
    this.quickFormError.set(null);
    this.quickFormLoading.set(true);
    try {
      switch (type) {
        case 'house':
          const house = this.houseForm();
          await this.houses.save(null, {
            name: house.name,
            description: house.description || undefined,
            houseTypeName: house.houseTypeName,
            address: {
              line1: '',
              city: house.city,
              country: house.country,
              region: undefined,
              postalCode: undefined
            },
            photos: []
          });
          this.toast.show('House created', 'success');
          break;
        case 'tour':
          const tour = this.tourForm();
          await this.tours.save(null, {
            name: tour.name,
            description: tour.description || undefined,
            tourCategoryName: tour.category,
            photos: []
          });
          this.toast.show('Tour created', 'success');
          break;
        case 'exchange':
          const order = this.exchangeForm();
          const amount = Number(order.amount);
          if (!order.baseCurrency || !order.quoteCurrency || !amount) {
            throw new Error('Please provide currencies and a valid amount.');
          }
          const payload = new CreateExchangeOrderRequest({
            baseCurrencyCode: order.baseCurrency,
            quoteCurrencyCode: order.quoteCurrency,
            baseAmount: amount
          });
          await this.exchange.createOrder(payload);
          await this.exchange.loadRates();
          this.toast.show('Exchange order submitted', 'success');
          break;
        case 'permission':
          const permission = this.permissionForm();
          await this.permissions.save(null, {
            code: permission.code,
            description: permission.description || undefined,
            isEnabled: permission.enabled
          });
          this.toast.show('Permission created', 'success');
          break;
      }
      this.closeQuickForm();
    } catch (err: any) {
      this.quickFormError.set(err?.message ?? 'Unable to create the item.');
    } finally {
      this.quickFormLoading.set(false);
    }
  }

  toggleSection(section: string) {
    this.expandedSection.update((cur) => (cur === section ? null : section));
  }

  canAccess(permission: string) {
    try {
      return this.auth.hasPermission(permission)();
    } catch {
      return false;
    }
  }

  getAccessSubItems(label: string) {
    const mod = this.modules.find((m) => m.label.toLowerCase() === label.toLowerCase());
    return mod?.subItems ?? [];
  }

  onChangePassword() {
    this.toast.show('Change password flow is not wired yet. Please use your identity provider.', 'info');
  }

  async logout() {
    try {
      await this.auth.logout();
    } catch {}
    this.tabs.closeAll();
    await this.router.navigateByUrl('/login');
  }
}
