import {mergeApplicationConfig}                         from '@angular/core';
import {bootstrapApplication, type BootstrapContext}    from '@angular/platform-browser';
import {provideServerRendering, RenderMode, withRoutes} from '@angular/ssr';

import {App}       from './app/app';
import {appConfig} from './app/app.config';

// The server render of the page, at the build: the table of the page prerenders in its loading state
const serverConfig = mergeApplicationConfig(appConfig, {providers: [provideServerRendering(withRoutes([{path: '**', renderMode: RenderMode.Prerender}]))]});

export default (context: BootstrapContext) => bootstrapApplication(App, serverConfig, context);
