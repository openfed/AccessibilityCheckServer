import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from '../../app.module';

import { SniffListComponent } from './sniff-list.component';

describe('SniffListComponent', () => {
  let component: SniffListComponent;
  let fixture: ComponentFixture<SniffListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule
      ],
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
