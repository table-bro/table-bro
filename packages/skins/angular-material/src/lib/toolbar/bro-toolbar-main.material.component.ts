import {ChangeDetectionStrategy, Component, computed, CUSTOM_ELEMENTS_SCHEMA, input, output} from '@angular/core';

import {MatIconButton}                                                    from '@angular/material/button';
import {MatIcon}                                                          from '@angular/material/icon';
import {MatToolbar}                                                       from '@angular/material/toolbar';
import {MatTooltip}                                                       from '@angular/material/tooltip';
import {type BroButton, type BroDropdown, type BroResolvedConfig, events} from '@table-bro/core';

/** The toolbar of a table: its title, its search and the buttons and the menu of the config. */
@Component({
  template: `
    <mat-toolbar>
      <button matIconButton class="bro-toolbar-placeholder"
              type="button" aria-label="">
        <mat-icon>menu</mat-icon>
      </button>

      <span>{{ title() }}</span>

      <span class="bro-toolbar-space"></span>

      <button matIconButton
              class="bro-toolbar-button-search"
              type="button" [attr.aria-label]="config()?.texts?.search"
              (click)="onClickSearch()">
        <mat-icon>search</mat-icon>
      </button>

      @for (button of mainButtons(); track $index) {
        <button matIconButton type="button" matTooltipPosition="above"
                [matTooltip]="button.buttonTooltip ?? ''"
                [attr.aria-label]="button.buttonTitle"
                (click)="onClickButton(button.eventType)">
          <mat-icon>{{ button.iconHTML }}</mat-icon>
        </button>
      }

      <!-- The menu is the element of withToolbarMenu(): a toolbar without a menu does not carry the menu of Material -->
      @if (dropdown(); as dropdown) {
        <bro-mat-toolbar-more matTooltipPosition="above"
                              [dropdown]="dropdown" [matTooltip]="dropdown.buttonTooltip ?? ''"
                              (action)="onMenuAction($event)"></bro-mat-toolbar-more>
      }
    </mat-toolbar>`,
  // Classes, not style attributes in the template, which a strict Content Security Policy blocks
  styles: `
    .bro-toolbar-placeholder {
      visibility: hidden;
    }

    .bro-toolbar-space {
      flex: 1 1 auto;
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatIcon,
    MatIconButton,
    MatToolbar,
    MatTooltip
  ]
})
export class BroMaterialToolbarMainComponent {
  /** The config of the table: the name of the search button. */
  readonly config = input<BroResolvedConfig>();

  // The table sets the buttons and the title before the element connects: the buttons as the JSON of the config
  readonly buttons = input<string>('[]');
  readonly title = input<string>('');

  readonly action = output<string>({alias: 'bro-toolbar'});

  /** The buttons and the one menu of the config. */
  private readonly toolbarButtons = computed<(BroButton | BroDropdown)[]>(() => JSON.parse(this.buttons()));

  readonly mainButtons = computed(() => <BroButton[]>this.toolbarButtons().filter(button => button.mode !== 'navbar-dropdown'));
  readonly dropdown = computed(() => <BroDropdown | undefined>this.toolbarButtons().find(button => button.mode === 'navbar-dropdown'));

  onClickSearch() {
    this.action.emit(events.toolbarSearchOpenEvent);
  }

  onClickButton(action: string) {
    this.action.emit(action);
  }

  /** The element of the menu sends the value of its item as the detail of its event action. */
  onMenuAction(event: Event) {
    this.action.emit((<CustomEvent<string>>event).detail);
  }
}
