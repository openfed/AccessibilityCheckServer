import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SniffUrlComponent } from './sniff-url.component';

describe('SniffUrlComponent', () => {
  let component: SniffUrlComponent;
  let fixture: ComponentFixture<SniffUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SniffUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SniffUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
