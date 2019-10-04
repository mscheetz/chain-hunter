import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTextComponent } from './search-text.component';

describe('SearchTextComponent', () => {
  let component: SearchTextComponent;
  let fixture: ComponentFixture<SearchTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
