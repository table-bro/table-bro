import {BroTagsComponent} from '../../shared/js/bro-tags';

/** The tags of the Bootstrap skin: its badges. */
export class BroBootstrapTagsComponent extends BroTagsComponent {
  protected readonly tagHTML: string = '<span class="badge rounded-pill text-bg-secondary me-1"></span>';
}
