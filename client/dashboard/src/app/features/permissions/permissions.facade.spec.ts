import { TestBed } from '@angular/core/testing';
import { PermissionsFacade } from './permissions.facade';
import { Client } from '../../api/client';


describe('PermissionsFacade', () => {
  let facade: PermissionsFacade;
  const clientMock = { permissionsAll: jasmine.createSpy('permissionsAll').and.returnValue(Promise.resolve({ items: [], total: 0 })) } as any as Client;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Client, useValue: clientMock }, PermissionsFacade] });
    facade = TestBed.inject(PermissionsFacade);
  });

  it('should load permissions', async () => {
    await facade.load();
    expect(facade.items()).toEqual([]);
    expect(facade.total()).toBe(0);
  });
});
