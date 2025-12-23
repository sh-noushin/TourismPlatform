import { TestBed } from '@angular/core/testing';
import { ToursFacade } from './tours.facade';
import { Client } from '../../api/client';

describe('ToursFacade', () => {
  let facade: ToursFacade;
  const clientMock = { toursAll: jest.fn().mockResolvedValue({ items: [], total: 0 }) } as any as Client;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: Client, useValue: clientMock }, ToursFacade] });
    facade = TestBed.inject(ToursFacade);
  });

  it('should load items', async () => {
    await facade.load();
    expect(facade.items()).toEqual([]);
    expect(facade.total()).toBe(0);
  });
});
