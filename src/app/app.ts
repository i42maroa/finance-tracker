import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Snackbar } from './shared/ui/snackbar/snackbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Snackbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
