import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SniffListComponent } from './sniff-list.component';

describe('SniffListComponent', () => {
  let component: SniffListComponent;
  let fixture: ComponentFixture<SniffListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SniffListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SniffListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
