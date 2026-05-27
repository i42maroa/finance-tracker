import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { ModalConfig } from '../../models/modal.model';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;
  let latestModal: ModalConfig | null;
  let subscription: Subscription;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
    subscription = service.modal$.subscribe((modal) => {
      latestModal = modal;
    });
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('opens a typed modal with payload', () => {
    service.open({
      type: 'transaction-form',
      data: { mode: 'create' },
    });

    expect(latestModal).toEqual({
      type: 'transaction-form',
      data: { mode: 'create' },
    });
  });

  it('closes the current modal', () => {
    service.open({ type: 'household-create' });

    service.close();

    expect(latestModal).toBeNull();
  });
});
