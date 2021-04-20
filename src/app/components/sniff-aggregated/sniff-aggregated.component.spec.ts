import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from '../../app.module';

import { SniffAggregatedComponent } from './sniff-aggregated.component';

describe('SniffComponent', () => {
  let component: SniffAggregatedComponent;
  let fixture: ComponentFixture<SniffAggregatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SniffAggregatedComponent);
    component = fixture.componentInstance;
    component.code = 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2';
    component.codeMessages = [
      ['Success criterion', '<a href="http://www.example.com">test</a>'],
      ['Suggested techniques', '<a href="http://www.example.com">test</a>']
    ];
    component.results = {
      hash: {
        numResults: 1,
        result: {
          code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
          context: 'foo',
          message: 'foo',
          selector: 'foo',
          type: 'notice',
          typeCode: 3
        },
      }
    };
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
