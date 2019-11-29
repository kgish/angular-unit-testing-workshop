import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AppComponent } from '../app.component';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let fixture;
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should be created successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct title', () => {
    fixture.detectChanges();

    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Tour of Heroes');

  });

  it('should display exactly two anchor tags', () => {
    fixture.detectChanges();

    const anchors = fixture.debugElement.queryAll(By.css('a'));
    expect(anchors.length).toEqual(2);
  });

  it('should have anchors that display the correct text', () => {
    fixture.detectChanges();

    const a1 = fixture.nativeElement.querySelector('a:first-child');
    expect(a1.textContent).toContain('Dashboard');

    const a2 = fixture.nativeElement.querySelector('a:nth-child(2)');
    expect(a2.textContent).toContain('Heroes');

    const anchors = fixture.debugElement.queryAll(By.css('a'));
    expect(anchors[ 0 ].nativeElement.textContent).toContain('Dashboard');
    expect(anchors[ 1 ].nativeElement.textContent).toContain('Heroes');
  });
});
