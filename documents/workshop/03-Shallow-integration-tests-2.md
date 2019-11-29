## Shallow Integration Tests II

This module consists of the following sections:

* [Dealing with Injected Services](#dealing-with-injected-services)
* [Mocking Child Components](#mocking-child-components)
* [Dealing with Lists](#dealing-with-lists)
* [Exercises](#exercises)


### Dealing with Injected Services

In the heroes component we are injecting the HeroService in the constructor.

```
import { Component, OnInit } from '@angular/core';
...
@Component({...})
export class HeroesComponent implements OnInit {

  constructor(private heroService: HeroService) { }  // <= Injected service

  ngOnInit() {
    this.getHeroes();
  }
}
```

In the `AppModule` this service is made available to all components by including it in the `providers` field:

```
import { NgModule } from '@angular/core';
...

@NgModule({
  imports: [
  ],
  declarations: [
  ],
  providers: [ HeroService ], // <= Declared here
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

In our test file we also want to test the `HeroService`, but we do not want to use the real service since under water
it makes HTTP  calls.

We will use mocks in order to draw a boundary around our unit test. Let's first start with the basic test setup and
see what happens:

```
describe('HeroesComponent (shallow tests)', () => {
  let component: HeroesComponent;
  let fixture: ComponentFixture<HeroesComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [ HeroesComponent ],
      providers: []
    });
    fixture = TestBed.createComponent(HeroesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

Running this test results in the following error:

```
Error: Template parse errors:
	Can't bind to 'hero' since it isn't a known property of 'app-hero'.
```

As previously, we need to use `NO_ERRORS_SCHEMA`:

```
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HeroesComponent (shallow tests)', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      ...
      schemas: [NO_ERRORS_SCHEMA]
    });
  });
});
```

Running this test again results in a new error:

```
Error: StaticInjectorError(DynamicTestModule)[HeroesComponent -> HeroService]: 
	  StaticInjectorError(Platform: core)[HeroesComponent -> HeroService]: 
	    NullInjectorError: No provider for HeroService!
```

Indeed, the component requires the `HeroService` and we still need to configure the test to include this service. We 
use the `long-hand way` to produce a new provider.

```
providers: [
  { provide: HeroService, useValue: mockHeroService }
]
```

This means that when the component within the test bed asks for a `HeroService`, we provide a mock service called
`MockHeroService`. We use jasmime to instantiate the spy object:

```
describe('HeroesComponent (shallow tests)', () => {
  let mockHeroService; // <= Added

  beforeEach(() => {
    mockHeroService = jasmine.createSpyObj([]);  // <= Added
    TestBed.configureTestingModule({
      providers: [
        { provide: HeroService, useValue: mockHeroService } // <= Added
      ],
    });
  });
});
```

Looking at the `HeroService`, we see that three methods will be used: `getHeroes`, `addHero` and `deleteHero`, so the
spy object needs to use them:

```
mockHeroService = jasmine.createSpyObj(['getHeroes', 'addHero', 'deleteHero']);
```

Run the tests and ensure that all tests succeed. Let's now check that we correctly set the value that's returned from
the `getHeroes` call.

Create the dummy data `HEROES` array to be returned by the jasmine spy object `getHeroes` method which as in the
`HeroService` needs to retun an `Observable` in this case using the `of` method from rxjs.

Don't forget to call `fixture.detectChanges` in order to trigger the service lifecycle and call the `ngOnInit` method.

```
import { of } from 'rxjs/internal/observable/of';

describe('HeroesComponent (shallow tests)', () => {
  let HEROES;

  beforeEach(() => {
    HEROES = [
      {id: 1, name: 'SpiderDude', strength: 8},
      {id: 2, name: 'Wonderful Woman', strength: 24},
      {id: 3, name: 'SuperDude', strength: 55}
    ];
  });

  it('should set heroes correctly from the service', () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    fixture.detectChanges();

    expect(component.heroes.length).toBe(3);
  });
});
```

### Mocking Child Components

In order to get at the child components we will need to comment out `NO_ERRORS_SCHEMA` and then create a mock component
that looks just like the `HeroComponent`, only it's much simpler.

The `styleUrls` and `templateUrl` are replaced by a simple `<div></div>` template, and this mock component is names
`FakeHeroComponent` and it is added to the test file.

```
describe('HeroesComponent (shallow tests)', () => {
  let HEROES;

  @Component({
    selector: 'app-hero',
    template: '<div></div>',
  })
  // export class FakeHeroComponent {  // <= remove export
  class FakeHeroComponent {
    @Input() hero: Hero;
    // @Output() delete = new EventEmitter();
  }

  beforeEach(() => {
   TestBed.configureTestingModule({
        declarations: [
          HeroesComponent,
          FakeHeroComponent             // <= Added
        ],
        // schemas: [NO_ERRORS_SCHEMA]  // <= Commented out (remove)
      });
    });
  });
}
```

Don't forget to remove the `export` from the class declaration and also add the `FakeHeroComponent` to the 
`declarations` section of the test bed. 

Make sure that all tests are now passing.


### Dealing with Lists

Now that our test includes the injected service as well as the child component, it's time to one step deeper and deal
with the list of elements inside of our integration test.

Looking inside of the `HeroesComponent.html` template we see a list of heroes which is generated as an unordered list
from the heroes array.

```
<ul class="heroes">
  <li *ngFor="let hero of heroes">
    <app-hero [hero]="hero" (delete)="delete(hero)"></app-hero>
  </li>
</ul>

```

Since the li-elements are the only ones on the page, we can simple look for and count them to give the number of
heroes displayed.

```
it('should create one li for each hero', () => {
  mockHeroService.getHeroes.and.returnValue(of(HEROES));
  fixture.detectChanges();

  const els = fixture.debugElement.queryAll(By.css('li'));
  expect(els.length).toBe(3);
});
```

Note that this is the very same test as the check for the number of hero array elements, excpet this time we're 
verifying that the list is displayed correctly in the template.

### Exercises

Feel free to create a new project for the following excercises.

Using the public [REST COUNTRIES](https://restcountries.eu) url endpoint, create a service called `CountryService`
that lists all countries by id, name, capital, population, and calling codes.

Define the country model as follows:
```
interface ICountry {
  alpha3Code: string;
  name: string;
  capital: string;
  population: number;
  flag: string;
  callingCodes: string[];
}
```

The `CountryService` supports the following methods:

* `getAll()` => return all countries.
* `getOne(id: string)` => return country with given id.
* `getByPopulation(population: number)` => return all countries with population greater than given population.

Create a `CountryComponent` that displays in its template the country name and its properties. The country object is
passed via the `@Input() country: ICountry` item.

Create a `CountriesComponent` that displays a list of countries, using the `CountryComponent` above.

Write unit tests for the `CountriesComponent` by mocking the `CountryService` using the jasmine spy object. The tests
should include all of the methods above: `getAll`, `getOne` and `getByPopulation`.

Don't forget to include `schemas: [NO_ERRORS_SCHEMA]` in the test bed.

Comment out `[NO_ERRORS_SCHEMA]` and mock the child `CountryComponent`.

Finally, write a unit test to validate that all the countries appear in the list.

Optional: Allow the countries to be filtered by providing a banner `A B C D E F ... X Y Z` (including only those
letters actually used) at the top of the page that the user can click to select only those countries starting with
that letter. Write unit tests for this.

Answer: Look in the `documents/exercises/country-demo` directory.

components/country.component.spec.ts
```
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
```

pages/home.component.spec.ts
```

```
