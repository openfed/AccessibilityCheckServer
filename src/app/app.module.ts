import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { CdkTableModule } from '@angular/cdk';
import {
  MdButtonModule,
  MdCheckboxModule,
  MdSelectModule,
  MdInputModule,
  MdTableModule,
  MdListModule,
  MdCardModule,
  MdPaginatorModule,
  MdSlideToggleModule,
  MdProgressSpinnerModule,
  MdDialogModule,
  MdSnackBarModule,
  MdTooltipModule
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ApiService } from './services/api.service';
import { ReinitService } from './services/reinit.service';
import { ImportExportService } from './services/import-export.service';

import { AppComponent } from './app.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { PagesFoundComponent } from './components/pages-found/pages-found.component';
import { SniffComponent } from './components/sniff/sniff.component';
import { SniffListComponent } from './components/sniff-list/sniff-list.component';
import { SniffUrlComponent } from './components/sniff-url/sniff-url.component';
import { SniffUrlDialogComponent } from './components/sniff-url/sniff-url-dialog.component';
import { TogglesComponent } from './components/toggles/toggles.component';
import { FederalheaderComponent } from './components/federalheader/federalheader.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchFormComponent,
    PagesFoundComponent,
    SniffComponent,
    SniffListComponent,
    SniffUrlComponent,
    SniffUrlDialogComponent,
    TogglesComponent,
    FederalheaderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MdCheckboxModule,
    MdTableModule,
    MdCardModule,
    CdkTableModule,
    MdListModule,
    MdButtonModule,
    MdSelectModule,
    MdPaginatorModule,
    MdInputModule,
    MdSlideToggleModule,
    MdProgressSpinnerModule,
    MdDialogModule,
    MdSnackBarModule,
    MdTooltipModule
  ],
  providers: [
    ApiService,
    ReinitService,
    ImportExportService
  ],
  entryComponents: [
    SniffUrlDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
