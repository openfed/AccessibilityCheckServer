import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppModule } from '../../app.module';

import { SniffComponent } from './sniff.component';

describe('SniffComponent', () => {
  let component: SniffComponent;
  let fixture: ComponentFixture<SniffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SniffComponent);
    component = fixture.componentInstance;
    component.code = 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2';
    component.codeMessages = [
      ['Success criterion', '<a href="http://www.example.com">test</a>'],
      ['Suggested techniques', '<a href="http://www.example.com">test</a>']
    ];
    component.results = {
      'http://www.example.com': [
        {
          code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
          context: 'foo',
          message: 'foo',
          selector: 'foo',
          type: 'notice',
          typeCode: 3
        }
      ]
    };
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
