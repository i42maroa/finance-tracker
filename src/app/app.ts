import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Loader } from './shared/ui/loader/loader';
import { Modal } from './shared/ui/modal/modal';
import { Navbar } from './shared/ui/navbar/navbar';
import { Snackbar } from './shared/ui/snackbar/snackbar';

@Component({
  selector: 'app-root',
  imports: [Loader, Modal, Navbar, RouterOutlet, Snackbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
