import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { ModalService } from '../../core/services/modal/modal.service';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    modalService = TestBed.inject(ModalService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  });

  it('renders the create transaction button', () => {
    const button = fixture.nativeElement.querySelector('app-circle-button');

    expect(button).not.toBeNull();
  });

  it('opens the create transaction modal', () => {
    const openSpy = vi.spyOn(modalService, 'open');

    fixture.componentInstance.openCreateTransactionModal();

    expect(openSpy).toHaveBeenCalledWith({
      type: 'transaction-form',
      data: { mode: 'create' },
    });
  });
});
