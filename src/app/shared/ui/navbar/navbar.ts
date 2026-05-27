import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { appNavItems } from '../../../app.routes';
import { NavItem } from '../../models/navigation.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  readonly navItems = appNavItems;

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  navItemTrackBy(_: number, item: NavItem): string {
    return item.route;
  }
}
