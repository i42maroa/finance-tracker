import { Component, EventEmitter, Input, Output } from '@angular/core';

type BasicButtonSize = 'default' | 'compact';
type BasicButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-basic-button',
  templateUrl: './basic-button.html',
  styleUrl: './basic-button.css',
})
export class BasicButton {
  @Input() disabled = false;
  @Input() size: BasicButtonSize = 'default';
  @Input() type: ButtonType = 'button';
  @Input() variant: BasicButtonVariant = 'primary';

  @Output() readonly pressed = new EventEmitter<void>();
}
