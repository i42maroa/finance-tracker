import { Component, EventEmitter, Input, Output } from '@angular/core';

type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-circle-button',
  templateUrl: './circle-button.html',
  styleUrl: './circle-button.css',
})
export class CircleButton {
  @Input({ required: true }) ariaLabel = '';
  @Input() type: ButtonType = 'button';
  @Input() disabled = false;

  @Output() readonly pressed = new EventEmitter<void>();
}
