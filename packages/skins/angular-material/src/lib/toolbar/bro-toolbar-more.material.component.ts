import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

import {MatIconButton}                        from '@angular/material/button';
import {MatDivider}                           from '@angular/material/divider';
import {MatIcon}                              from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import type {BroDropdown}                     from '@table-bro/core';

/**
 * The menu of the toolbar, the element bro-mat-toolbar-more of withToolbarMenu(): a button with the title of the menu as
 * its name, and the items that send their values.
 */
@Component({
  template: `
    @if (dropdown(); as dropdown) {
      <button matIconButton
              [attr.aria-label]="dropdown.buttonTitle"
              [matMenuTriggerFor]="menu">
        <mat-icon>more_vert</mat-icon>
      </button>

      <mat-menu #menu="matMenu">
        @for (option of dropdown.options; track $index) {
          @if (option.divider) {
            <mat-divider></mat-divider>
          } @else {
            <button mat-menu-item (click)="onClickButton(option.value)">
              @if (option.iconHTML) {
                <mat-icon>{{ option.iconHTML }}</mat-icon>
              }
              <span>{{ option.title }}</span>
            </button>
          }
        }
      </mat-menu>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ]
})
export class BroMaterialToolbarMoreComponent {
  // The toolbar binds its dropdown after the element connects
  readonly dropdown = input<BroDropdown>();

  readonly action = output<string>();

  onClickButton(action: string | undefined) {
    this.action.emit(<string>action);
  }
}
