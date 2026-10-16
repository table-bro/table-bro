import type {BroRowSlot}                                                        from '../model/row-slots';
import {detailsServerFailedEvent, detailsServerLoadedEvent, detailsToggleEvent} from '../shared/events';
import type {BroUpdater}                                                        from '../shared/frame';
import {bubbleAction, dispatchAction}                                           from '../shared/interaction';
import type {BroContext}                                                        from '../types/context';
import type {BroBodyController}                                                 from './body.controller';

/**
 * The details of the rows: a row opens or closes them, and server details load at their first opening, with the
 * progress of the loading in the row.
 */
export class BroDetailsController {
  constructor(private readonly ctx: BroContext, private readonly update: BroUpdater, private readonly bodyCtrl: BroBodyController) {
  }

  /**
   * The details button of a row, or a custom cell, asks to open or to close the details of its row.
   * @phase input
   */
  onToggle(target: EventTarget | null): void {
    const {config, model} = this.ctx;

    const slot = model.slots.of(target);

    if (!slot) {
      return;
    }

    if (config.rowDetailsComponent) {
      if (!config.rowDetailsServer) {
        this.onDetails(slot);
      } else {
        this.onServerDetails(slot);
      }
    }
  }

  /**
   * Opens or closes the details of the row.
   * @phase input
   */
  private onDetails(slot: BroRowSlot) {
    this.update(detailsToggleEvent, {
      render: frame => this.bodyCtrl.renderDetails(frame, slot)
    });
  }

  /**
   * Opens or closes server details. The first opening loads them: the row shows the progress until the component of the
   * details reports the end of its loading.
   * @phase input
   */
  private onServerDetails(slot: BroRowSlot) {
    const {config, view} = this.ctx;

    if (slot.details) {
      this.onDetails(slot);

      return;
    }

    // The details of the row are loading: the progress shows it
    const loading = !!slot.progressBar;

    if (loading) {
      return;
    }

    this.update(detailsToggleEvent, {
      render: () => {
        view.tbody.renderDetailsLoading(slot, true);
        view.tbody.renderDetailsButton(slot, true);
        // The progress of the details lies in the aux table, which screen readers do not see
        view.regions.announce(config.texts.detailsLoading);

        view.tbodyAux.renderProgressBar(slot, config.rowDetailsProgressMode);

        const details = view.tbodyAux.createServerDetails(slot);

        slot.loadingDetails = details;

        // The details load once: a component that reports its loading or its failure again, also when it connects again
        // in the details row while they open, changes nothing
        let loaded = false;

        details.addEventListener(detailsServerLoadedEvent, (event: Event) => {
          const progress: number = (<CustomEvent>event).detail;

          if (loaded) {
            return;
          }

          if (progress === 1) {
            loaded = true;

            this.update(detailsServerLoadedEvent, {
              render: frame => {
                // A row that left the table while its details loaded takes them along
                if (!slot.displayed) {
                  return;
                }

                view.tbodyAux.renderProgressBarValue(slot, progress);

                slot.loadingDetails = null;

                this.bodyCtrl.renderDetails(frame, slot, details);

                view.tbodyAux.unrenderProgressBar(slot);

                view.tbody.renderDetailsLoading(slot, false);

                // The live region no longer says the loading once the details of every row loaded
                this.bodyCtrl.renderLiveStatus();
              },
              events: () => bubbleAction(event)
            });
          } else {
            this.update(detailsServerLoadedEvent, {
              render: () => view.tbodyAux.renderProgressBarValue(slot, progress)
            });
          }
        }, {signal: this.ctx.signal});

        // A component whose loading failed reports it: the row ends its loading closed, and its next opening loads again
        details.addEventListener(detailsServerFailedEvent, () => {
          if (loaded) {
            return;
          }

          loaded = true;

          this.update(detailsServerFailedEvent, {
            render: () => {
              if (!slot.displayed) {
                return;
              }

              slot.loadingDetails = null;

              view.tbodyAux.unrenderServerDetails(details);
              view.tbodyAux.unrenderProgressBar(slot);

              view.tbody.renderDetailsLoading(slot, false);
              view.tbody.renderDetailsButton(slot, false);

              this.bodyCtrl.renderLiveStatus();
            },
            // The component left the table: its row sends the failure on
            events: () => dispatchAction(slot.tr, detailsServerFailedEvent)
          });
        }, {signal: this.ctx.signal});

        view.tbodyAux.renderServerDetails(slot, details);
      }
    });
  }
}
