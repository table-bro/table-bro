import {Component} from '@angular/core';

import {OrdersComponent} from './orders.component';

@Component({
  selector: 'app-root',
  template: '<app-orders></app-orders>',
  imports: [
    OrdersComponent
  ]
})
export class App {}
