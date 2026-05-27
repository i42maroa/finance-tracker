import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Modal } from './shared/ui/modal/modal';
import { Navbar } from './shared/ui/navbar/navbar';
import { Snackbar } from './shared/ui/snackbar/snackbar';

@Component({
  selector: 'app-root',
  imports: [Modal, Navbar, RouterOutlet, Snackbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
