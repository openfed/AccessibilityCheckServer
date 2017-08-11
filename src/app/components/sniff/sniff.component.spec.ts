import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SniffComponent } from './sniff.component';

describe('SniffComponent', () => {
  let component: SniffComponent;
  let fixture: ComponentFixture<SniffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SniffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SniffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
