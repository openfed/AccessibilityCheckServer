import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CdkTableModule } from '@angular/cdk/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ApiService } from './services/api.service';
import { ReinitService } from './services/reinit.service';
import { ImportExportService } from './services/import-export.service';
import { SniffListService } from './services/sniff-list.service';

import { AppComponent } from './app.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { PagesFoundComponent } from './components/pages-found/pages-found.component';
import { SniffComponent } from './components/sniff/sniff.component';
import { SniffListComponent } from './components/sniff-list/sniff-list.component';
import { SniffUrlComponent } from './components/sniff-url/sniff-url.component';
import { SniffUrlDialogComponent } from './components/sniff-url/sniff-url-dialog.component';
import { PrintDialogComponent } from './components/search-form/print-dialog/print-dialog.component';
import { TogglesComponent } from './components/toggles/toggles.component';
import { FederalheaderComponent } from './components/federalheader/federalheader.component';
import { SniffAggregatedComponent } from './components/sniff-aggregated/sniff-aggregated.component';
import { SniffAggregatedItemComponent } from './components/sniff-aggregated-item/sniff-aggregated-item.component';
import { WebImportDialogComponent } from './components/search-form/web-import-dialog/web-import-dialog.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    SearchFormComponent,
    PagesFoundComponent,
    SniffComponent,
    SniffAggregatedComponent,
    SniffAggregatedItemComponent,
    SniffListComponent,
    SniffUrlComponent,
    SniffUrlDialogComponent,
    PrintDialogComponent,
    TogglesComponent,
    FederalheaderComponent,
    WebImportDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatTableModule,
    MatCardModule,
    CdkTableModule,
    MatListModule,
    MatButtonModule,
    MatSelectModule,
    MatPaginatorModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule.forRoot([])
  ],
  providers: [ApiService, ReinitService, ImportExportService, SniffListService],
  bootstrap: [AppComponent]
})
export class AppModule {}
