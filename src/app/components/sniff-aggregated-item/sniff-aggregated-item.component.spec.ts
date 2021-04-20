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
    component.result = {
      result: {
        code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
        context: 'foo',
        message: 'foo',
        selector: 'foo',
        type: 'notice',
        typeCode: 3
      },
      numResults: 1
    };
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
