import {provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import {bootstrapApplication}                              from '@angular/platform-browser';

import {provideTableBroMatSkin, withSwitch, withTags, withToolbarMenu} from '@table-bro/angular-material';
import {defineTableBroFilterDrawerContainer}                           from '@table-bro/core';

import {FeatureDetailsElement} from './feature-details';
import {registerStandSkins}    from './stand-skins';
import {StandComponent}        from './stand.component';

// The tables measure their titles and values with the fonts that show them: the faces of Roboto load before the
// application, else they come after the measurement. A face that fails to load does not hold the application
Promise.allSettled(['400 14px Roboto', '500 14px Roboto'].map(font => document.fonts.load(font)))
  .then(() => bootstrapApplication(StandComponent, {
    providers: [
      provideZoneChangeDetection(),
      provideTableBroMatSkin(withTags(), withSwitch(), withToolbarMenu()),
      // After the skin mat: the skins with a Filters button and a sample menu, the vanilla filter drawer, the details
      provideAppInitializer(() => {
        registerStandSkins();
        defineTableBroFilterDrawerContainer();
        customElements.define('stand-feature-details', FeatureDetailsElement);
      })
    ]
  }))
  .catch(err => console.error(err));
