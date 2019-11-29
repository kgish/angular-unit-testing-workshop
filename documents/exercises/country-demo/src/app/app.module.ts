import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// --- MODULES --- //
import {
  MaterialModule
} from './modules';

// --- COMPONENTS --- //
import {
  CountryComponent,
  ToolbarComponent
} from './components';

// --- PAGES --- //
import {
  HomeComponent
} from './pages';

@NgModule({
  declarations: [
    AppComponent,
    CountryComponent,
    HomeComponent,
    ToolbarComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    MaterialModule

  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
