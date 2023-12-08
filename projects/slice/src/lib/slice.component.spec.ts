import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliceComponent } from './slice.component';

describe('SliceComponent', () => {
  let component: SliceComponent;
  let fixture: ComponentFixture<SliceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SliceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
