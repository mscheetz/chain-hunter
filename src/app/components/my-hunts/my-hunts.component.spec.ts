import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHuntsComponent } from './my-hunts.component';

describe('MyHuntsComponent', () => {
  let component: MyHuntsComponent;
  let fixture: ComponentFixture<MyHuntsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyHuntsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyHuntsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
