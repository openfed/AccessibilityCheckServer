import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FederalheaderComponent } from './federalheader.component';

describe('FederalheaderComponent', () => {
  let component: FederalheaderComponent;
  let fixture: ComponentFixture<FederalheaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FederalheaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FederalheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
