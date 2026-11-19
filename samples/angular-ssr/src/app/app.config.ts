import {type ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideClientHydration}                                     from '@angular/platform-browser';

import {provideTableBroMatSkin} from '@table-bro/angular-material';

// The config of the browser and of the server render: the hydration takes the page that the server has rendered
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideTableBroMatSkin(),
    provideClientHydration()
  ]
};
