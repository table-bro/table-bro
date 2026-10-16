import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon}                  from '@angular/material/icon';

/** The button of the skin, the element bro-mat-button with the properties of BroButton. */
@Component({
  template: `
    @if (buttonTitle()) {
      <button matButton
              type="button" [class]="buttonClassName()"
              [attr.aria-label]="label()"
              (click)="onClickButton()">
        @if (icon()) {
          <mat-icon>{{ icon() }}</mat-icon>
        }
        {{ buttonTitle() }}
      </button>
    } @else if (icon()) {
      <button matIconButton
              type="button"
              [class]="buttonClassName()"
              [attr.aria-label]="label()"
              (click)="onClickButton()">
        <mat-icon>{{ icon() }}</mat-icon>
      </button>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton,
    MatIcon,
    MatIconButton
  ]
})
export class BroMaterialButtonComponent {
  readonly buttonClassName = input<string | null>(undefined, {alias: 'button-class'});
  readonly buttonTitle = input<string>('', {alias: 'button-title'});
  readonly eventType = input<string>('', {alias: 'event-type'});
  readonly icon = input<string>();
  /** The name of a button without a title: the table gives it as the attribute label, not aria-label on the element. */
  readonly label = input<string>();

  readonly action = output<string>();

  onClickButton() {
    this.action.emit(this.eventType());
  }
}
