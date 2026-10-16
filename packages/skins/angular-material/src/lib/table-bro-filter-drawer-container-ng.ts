import {afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, input, model, output, signal, viewChild} from '@angular/core';

import {MatIconButton}                                                                                                                                                  from '@angular/material/button';
import {MatIcon}                                                                                                                                                        from '@angular/material/icon';
import {MatDrawer, MatDrawerContainer, MatDrawerContent, type MatDrawerMode}                                                                                            from '@angular/material/sidenav';
import {MatToolbar}                                                                                                                                                     from '@angular/material/toolbar';
import {type BroServerFacade, TableBroNg}                                                                                                                               from '@table-bro/angular';
import {type BroActionDetail, type BroCol, type BroConfig, type BroEmptyState, type BroFilters, type BroQuery, type BroUserTheme, dispatchAction, events, resolveTexts} from '@table-bro/core';

import {matSkinConfig} from './table-bro.angular-material.config';

/**
 * The table with the filter drawer of the mat skin: mat-drawer-container with <table-bro-ng> in its content and the filters
 * of the application, the content of this component, in mat-drawer. It takes the inputs and gives the outputs
 * of <table-bro-ng>. The Filters button of the table toolbar opens the drawer, any other button of the page calls toggle().
 * Material opens the drawer and narrows the table in the side mode; the card of the skin in the drawer grows
 * from its right edge. A table that would get narrower than its minimum width next to the drawer keeps its width:
 * the drawer lies over it in the mode over, with the scrim of Material, as the modal side sheet of Material 3.
 */
@Component({
  selector: 'table-bro-filter-drawer-container-ng',
  template: `
    <mat-drawer-container [class.bro-filter-drawer_no-shadow]="!shadowsEnabled()">
      <mat-drawer-content>
        <table-bro-ng [class.bro-table-shadow-container]="shadowsEnabled()"
                      [tableId]="tableId()" [cols]="cols()" [rows]="rows()" [conf]="conf()"
                      [total]="total()" [rowsToAppend]="rowsToAppend()" [emptyState]="emptyState()"
                      [loading]="loading()" [failed]="failed()"
                      [filter]="filter()" [theme]="theme()"
                      (action)="onTableAction($event)"
                      (query)="query.emit($event)"></table-bro-ng>
      </mat-drawer-content>

      <mat-drawer position="end"
                  [class.bro-filter-drawer_no-shadow]="!shadowsEnabled()" [mode]="drawerMode()"
                  [opened]="opened()" (openedChange)="opened.set($event)">
        <div class="bro-filter-drawer-card" [class]="shadowClassName()">
          <div class="bro-filter-drawer-header">
            <mat-toolbar>
              <span class="bro-filter-drawer-title">{{ texts().filters }}</span>

              <button matIconButton class="bro-filter-drawer-close" type="button"
                      [attr.aria-label]="texts().close"
                      (click)="setOpened(false)">
                <mat-icon>close</mat-icon>
              </button>
            </mat-toolbar>
          </div>

          <div>
            <ng-content></ng-content>
          </div>
        </div>
      </mat-drawer>
    </mat-drawer-container>`,
  styles: `
    :host {
      display: block;
    }

    /* The shadows of the table and of the card lie outside of them; the drawer stands in its place, nothing to clip */
    mat-drawer-container,
    mat-drawer-content {
      overflow: visible;
    }

    /*
     * One motion for the drawer, the content, and the width of the card. Material turns it on with mat-drawer-transition,
     * and not under prefers-reduced-motion. The standard curve of Material starts softer than the curve of mat-drawer.
     * The transform of the drawer is an identity (the skin), its transition only gives Material its events
     */
    .mat-drawer-transition mat-drawer,
    .mat-drawer-transition mat-drawer-content,
    .mat-drawer-transition .bro-filter-drawer-card {
      transition-duration: calc(var(--bro-filter-drawer-duration) * var(--bro-duration-scale));
      transition-timing-function: cubic-bezier(.4, 0, .2, 1);
    }

    .mat-drawer-transition .bro-filter-drawer-card {
      transition-property: --bro-filter-drawer-opened;
    }

    .bro-filter-drawer-header {
      position: sticky;
      top: 0;
      z-index: 1;
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'mat',
    '[class.bro-dark-theme]': 'dark()',
    '[class.bro-light-theme]': 'light()'
  },
  imports: [
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatIcon,
    MatIconButton,
    MatToolbar,
    TableBroNg
  ]
})
export class TableBroFilterDrawerContainerNg<MODEL extends object> implements BroServerFacade<MODEL> {
  /* The inputs and the outputs of <table-bro-ng> */
  cols = input.required<BroCol<MODEL>[]>();
  rows = input.required<MODEL[] | undefined | null>();
  conf = input.required<BroConfig<MODEL>>();

  total = input<number>();
  rowsToAppend = input<MODEL[] | undefined>();
  loading = input<boolean>(false);
  failed = input<boolean>(false);

  filter = input<BroFilters<MODEL> | undefined>();
  emptyState = input<BroEmptyState>();
  tableId = input<string>();
  theme = input<BroUserTheme | null>();

  action = output<BroActionDetail<MODEL>>();
  query = output<BroQuery<MODEL>>();

  /* The drawer */
  /** Whether the drawer is opened; [(opened)] binds it both ways. */
  opened = model<boolean>(false);
  /**
   * The mode of mat-drawer: side, by default, narrows the content, and the drawer lies over a table that would get
   * narrower than its minimum width; over lies over the table always, with the scrim of Material; push as in Material.
   */
  mode = input<MatDrawerMode>('side');

  /** The drawer lies over a table that would not keep its minimum width next to it. */
  protected over = signal<boolean>(false);
  protected drawerMode = computed<MatDrawerMode>(() => this.over() ? 'over' : this.mode());

  /** With shadows the table lets them into its margins and takes the full width; the card has the shadow too. */
  protected shadowsEnabled = computed(() => this.conf().shadowsEnabled !== false);
  /** The class of the shadow of the skin config, as the card of the drawer of the core takes it. */
  protected shadowClassName = computed(() => this.shadowsEnabled() ? matSkinConfig.css.shadow.className : '');

  /** The texts of the config of the table: the title of the drawer and the name of its close button. */
  protected texts = computed(() => resolveTexts(this.conf().texts));

  /** The host of the table has the class of the dark theme: the container takes it too, as the drawer of the core does. */
  protected dark = signal<boolean>(false);
  /** The host of the table has the class of its own light theme: the container stays light under a dark ancestor too. */
  protected light = signal<boolean>(false);

  private host = inject(ElementRef);
  private container = viewChild.required(MatDrawerContainer);
  private content = viewChild.required(MatDrawerContent, {read: ElementRef});
  private drawer = viewChild.required(MatDrawer);
  private drawerElement = viewChild.required(MatDrawer, {read: ElementRef});

  constructor() {
    // A narrower or a wider page moves the opened drawer over the table or next to it
    const resizeObserver = new ResizeObserver(() => this.fitMode());

    const destroyRef = inject(DestroyRef);

    resizeObserver.observe(this.host.nativeElement);
    destroyRef.onDestroy(() => resizeObserver.disconnect());

    // The theme of the table is the class of its host, which the table changes with its theme
    afterNextRender(() => {
      const table: HTMLElement | null = this.content().nativeElement.querySelector('table-bro');

      if (!table) {
        return;
      }

      const readTheme = () => {
        this.dark.set(table.classList.contains('bro-dark-theme'));
        this.light.set(table.classList.contains('bro-light-theme'));
      };

      const themeObserver = new MutationObserver(readTheme);

      themeObserver.observe(table, {attributes: true, attributeFilter: ['class']});
      destroyRef.onDestroy(() => themeObserver.disconnect());

      readTheme();
    });
  }

  toggle(): void {
    this.setOpened(!this.opened());
  }

  /** The Filters button of the table toolbar opens the drawer; every action goes on to the page. */
  protected onTableAction(event: BroActionDetail<MODEL>): void {
    if (event.action === events.filtersToggleEvent) {
      this.toggle();
    }

    this.action.emit(event);
  }

  /**
   * Opens or closes the drawer and narrows the content in the same frame. Material narrows it on transitionrun
   * of the drawer, a frame later, so the space between the table and the card would change while they move.
   */
  protected setOpened(opened: boolean): void {
    if (opened && this.mode() === 'side') {
      this.over.set(!this.fitsNextToDrawer());

      // Material takes the mode at the toggle below, before the next check of the template
      this.drawer().mode = this.drawerMode();
    }

    this.fitTableColumns(opened);

    this.opened.set(opened);

    this.drawer().toggle(opened);
    this.container().updateContentMargins();
  }

  /**
   * Moves the opened drawer over the table when the table would get narrower than its minimum width next to it, and
   * back next to it when it fits again: the table takes its new width at once, and the scrim of Material comes or goes
   * by its transition; the drawer keeps its place at the right edge.
   */
  private fitMode(): void {
    if (!this.opened() || this.mode() !== 'side') {
      return;
    }

    const over = !this.fitsNextToDrawer();

    if (over === this.over()) {
      return;
    }

    this.over.set(over);
    this.drawer().mode = this.drawerMode();
    this.fitTableColumns(true);
    this.container().updateContentMargins();
  }

  /** The table keeps at least its minimum width next to the opened drawer: the width of the drawer holds its space. */
  private fitsNextToDrawer(): boolean {
    const content: HTMLElement = this.content().nativeElement;
    const table: HTMLElement | null = content.querySelector('table-bro');

    if (!table) {
      return true;
    }

    // The width comes from the content, without the room that a table leaves for its shadows when no shadow container
    // takes them
    const shadowRoom = this.shadowsEnabled() ? 0 : 2 * parseFloat(getComputedStyle(table).getPropertyValue('--bro-shadow-size'));
    const width = content.getBoundingClientRect().width + parseFloat(getComputedStyle(content).marginRight) - shadowRoom;

    return width - this.drawerElement().nativeElement.offsetWidth >= parseFloat(getComputedStyle(table).getPropertyValue('--bro-table-min-width'));
  }

  /**
   * Gives the table at once the width it has at the end of the transition: the drawer has a fixed width, so the columns
   * take their new widths right at the click and come with the table. In the side mode Material narrows the content
   * by the width of the drawer; during a transition the content counts from its margin at this moment.
   */
  private fitTableColumns(opened: boolean): void {
    const content: HTMLElement = this.content().nativeElement;
    const table: HTMLElement | null = content.querySelector('table-bro');

    if (!table) {
      return;
    }

    const margin = parseFloat(getComputedStyle(content).marginRight);
    const targetMargin: number = (opened && this.drawerMode() === 'side') ? this.drawerElement().nativeElement.offsetWidth : 0;
    // A table at its minimum width is wider than the content: the width comes from the content
    const shadowRoom = this.shadowsEnabled() ? 0 : 2 * parseFloat(getComputedStyle(table).getPropertyValue('--bro-shadow-size'));

    dispatchAction(table, events.columnsWidthEvent, content.getBoundingClientRect().width + margin - targetMargin - shadowRoom);
  }
}
