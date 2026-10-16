import {type ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';

import {provideTableBroMatSkin} from '@table-bro/angular-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideTableBroMatSkin()
  ]
};
