import { TestBed, async } from "@angular/core/testing";

import { AppComponent } from "./app.component";
import { SearchFormComponent } from "./components/search-form/search-form.component";
import { PagesFoundComponent } from "./components/pages-found/pages-found.component";
import { SniffComponent } from "./components/sniff/sniff.component";
import { SniffListComponent } from "./components/sniff-list/sniff-list.component";
import { SniffUrlComponent } from "./components/sniff-url/sniff-url.component";
import { SniffUrlDialogComponent } from "./components/sniff-url/sniff-url-dialog.component";
import { PrintDialogComponent } from "./components/search-form/print-dialog.component";
import { TogglesComponent } from "./components/toggles/toggles.component";
import { FederalheaderComponent } from "./components/federalheader/federalheader.component";

import { AppModule } from "./app.module";
import { ApiService } from "./services/api.service";
import { ReinitService } from "./services/reinit.service";
import { ImportExportService } from "./services/import-export.service";
import { SniffListService } from "./services/sniff-list.service";

import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { CdkTableModule } from "@angular/cdk/table";
import {
  MatButtonModule,
  MatCheckboxModule,
  MatSelectModule,
  MatInputModule,
  MatTableModule,
  MatListModule,
  MatCardModule,
  MatPaginatorModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatSnackBarModule,
  MatTooltipModule
} from "@angular/material";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("AppComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should render title in a h1 tag", async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("h1").textContent).toContain(
      "Accessibility Check"
    );
  }));
});
