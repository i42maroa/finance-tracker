import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ModalConfig } from '../../models/modal.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly modalSubject = new BehaviorSubject<ModalConfig | null>(null);

  readonly modal$ = this.modalSubject.asObservable();

  open(config: ModalConfig): void {
    this.modalSubject.next(config);
  }

  close(): void {
    this.modalSubject.next(null);
  }
}
