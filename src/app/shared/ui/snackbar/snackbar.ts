import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { SnackbarService } from '../../../core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-snackbar',
  imports: [CommonModule],
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.css',
})
export class Snackbar {
  readonly snackbarService = inject(SnackbarService);
}
