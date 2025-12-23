import { TestBed } from '@angular/core/testing';
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
