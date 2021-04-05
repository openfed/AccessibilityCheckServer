import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { WebImportDialogComponent } from "./web-import-dialog.component";

describe("WebImportDialogComponent", () => {
  let component: WebImportDialogComponent;
  let fixture: ComponentFixture<WebImportDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebImportDialogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
