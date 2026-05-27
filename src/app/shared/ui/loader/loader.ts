import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { LoaderService } from '../../../core/services/loader/loader.service';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class Loader {
  readonly loaderService = inject(LoaderService);
}
