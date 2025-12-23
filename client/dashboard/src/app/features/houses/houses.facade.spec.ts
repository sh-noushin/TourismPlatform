import { TestBed } from '@angular/core/testing';
import { HousesFacade } from './houses.facade';
import { Client } from '../../api/client';

describe('HousesFacade', () => {
  let facade: HousesFacade;
  const clientMock = { housesAll: jest.fn().mockResolvedValue({ items: [], total: 0 }) } as any as Client;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Client, useValue: clientMock }, HousesFacade] });
    facade = TestBed.inject(HousesFacade);
  });

  it('should load items', async () => {
    await facade.load();
    expect(facade.items()).toEqual([]);
    expect(facade.total()).toBe(0);
  });
});
