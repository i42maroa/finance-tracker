import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  readonly modalService = inject(ModalService);

  close(): void {
    this.modalService.close();
  }
}
