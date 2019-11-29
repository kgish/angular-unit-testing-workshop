import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CountryComponent } from './country.component';
import { By } from '@angular/platform-browser';
import { ICountry } from '../../services/country.interface';

describe('CountryComponent', () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;

  const country: ICountry = {
    alpha3Code: 'ALB',
    name: 'Albania',
    capital: 'Tirania',
    population: 2886026,
    flag: 'https://restcountries.eu/data/alb.svg',
    callingCodes: ['355']
  };

  const selector = 'mat-card-subtitle';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CountryComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;
    component.country = country;

    fixture.detectChanges();
  });

  it('should have the correct country', () => {
    expect(component.country.name).toEqual(country.name);
  });

  it('should render the country name in a mat-card element', () => {
    const nativeElement = fixture.nativeElement.querySelector(selector);
    expect(nativeElement.textContent).toContain(country.name);

    const debugElement = fixture.debugElement.query(By.css(selector));
    expect(debugElement.nativeElement.textContent).toContain(country.name);
  });

});
