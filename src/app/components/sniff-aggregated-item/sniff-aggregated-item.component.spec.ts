import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../../app.module';

import { SniffAggregatedItemComponent } from './sniff-aggregated-item.component';

describe('SniffAggregatedItemComponent', () => {
  let component: SniffAggregatedItemComponent;
  let fixture: ComponentFixture<SniffAggregatedItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SniffAggregatedItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
