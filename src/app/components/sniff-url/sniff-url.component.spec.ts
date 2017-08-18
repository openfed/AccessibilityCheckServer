import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../../app.module';

import { SniffUrlComponent } from './sniff-url.component';

describe('SniffUrlComponent', () => {
  let component: SniffUrlComponent;
  let fixture: ComponentFixture<SniffUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SniffUrlComponent);
    component = fixture.componentInstance;
    component.url = 'http://www.example.com';
    component.urlResults = [];
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
