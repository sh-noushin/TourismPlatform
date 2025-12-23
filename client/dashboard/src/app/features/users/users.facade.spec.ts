import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UsersFacade } from './users.facade';

describe('UsersFacade', () => {
  let facade: UsersFacade;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [UsersFacade] });
    facade = TestBed.inject(UsersFacade);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads user list and patches signals', async () => {
    const loadPromise = facade.load();
    const req = http.expectOne('/api/superuser/users');
    req.flush({ items: [{ id: '1', email: 'a@test.com' }], total: 1 });
    await loadPromise;
    expect(facade.items()).toHaveLength(1);
    expect(facade.total()).toBe(1);
  });
});import { TestBed } from '@angular/core/testing';
import { UsersFacade } from './users.facade';
import { Client } from '../../api/client';

describe('UsersFacade', () => {
  let facade: UsersFacade;
  const clientMock = { usersAll: jest.fn().mockResolvedValue({ items: [], total: 0 }) } as any as Client;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Client, useValue: clientMock }, UsersFacade] });
    facade = TestBed.inject(UsersFacade);
  });

  it('should load users', async () => {
    await facade.load();
    expect(facade.items()).toEqual([]);
    expect(facade.total()).toBe(0);
  });
});
