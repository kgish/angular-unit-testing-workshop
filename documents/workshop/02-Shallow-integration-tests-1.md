## Shallow Integration Tests I

This module consists of the following sections:

* [Debugging Techniques](#debugging-techniques)
* [The Testbed](#the-testbed)
* [Ignoring child components](#ignoring-child-components)
* [Testing templates with nativeElement](#testing-templates-with-nativeelement)
* [Testing templates with debugElement](#testing-templates-with-debugelement)
* [Exercises](#exercises)


### Debugging Techniques

```
chrome devtools
  open/close with ctrl-shift-i
  console
  ng.probe($0).componentInstance
logger
json pipe
.tap()
redux devtool for ngrx
debugger statement
conditional breakpoints
```

The `zone.js` and debugging do not always work well together, some problems and exceptions are not displayed correctly
or remain hidden.

By setting the `--source-map` flag to false, this can be made to work better. 

package.json:
```
{
  "scripts": {
    "test": "ng test --source-map=false"
  }
}
```

### The Testbed

Normally during creation of the component, a spec file is created for you automatically:

```
$ ng generate component hero
$ cat hero/hero.component.spec.ts
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

However, in this exercise we will build everything from scratch which gives one a better understanding of the 
underlying concepts.

In this example we will be having a look at the `HeroComponent`.

hero.components.ts
```
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls:  ['./hero.component.css']
})
export class HeroComponent {
  @Input() hero: Hero;
  @Output() delete = new EventEmitter();

  onDeleteClick($event): void {
    $event.stopPropagation();
    this.delete.next();
  }
}
```

hero.components.html
```
<a routerLink="/detail/{{hero.id}}">
  <span class="badge">{{hero.id}}</span> {{hero.name}}
</a>
<button class="delete" (click)="onDeleteClick($event)">x</button>
```

In the `app.module.ts` file there are a numer of components defined in the **declarations** section, as well as a
couple of services defined in the **providers** section.
```
@NgModule({
  imports: [
    ...
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    HeroesComponent,
    HeroDetailComponent,
    MessagesComponent,
    HeroSearchComponent,
    StrengthPipe,
    HeroComponent,
    CapitalizeWordsPipe
  ],
  providers: [ HeroService, MessageService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
```

In the `hero.component.spec.ts` test file we will only need a subset of these.
```
describe('HeroComponent (shallow tests)', () => {
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeroComponent],
    });
    fixture = TestBed.createComponent(HeroComponent);
  });
})
```
First test:
```
  it('should have the correct hero', () => {
    fixture.componentInstance.hero = { id: 1, name: 'SuperDude', strength: 3};

    expect(fixture.componentInstance.hero.name).toEqual('SuperDude');
  });
```

When you run `npm run test` the following error message appears:
```
Error: Template parse errors:
Can't bind to 'routerLink' since it isn't a known property of 'a'. ("<a [ERROR ->]routerLink="/detail/{{hero.id}}">
  <span class="badge">{{hero.id}}</span> {{hero.name}}
</a>
```

This is included in the `app.module.ts` file in the **imports** section by `AppRoutingModule:
```
@NgModule({
  imports: [
    AppRoutingModule,
  ],
```

### Ignoring child components

The error above can be disabled by using `NO_ERRORS_SCHEMA` as follows:
```
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe('HeroComponent (shallow tests)', () => {
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeroComponent],
      schemas: [NO_ERRORS_SCHEMA]               // <= added
    });
    fixture = TestBed.createComponent(HeroComponent);
  });
})
```

While this solved the test error, it does hide other potential issues, like typos in html component names or 
directives, so use with care.

For example, mispelling web components like `<buttom>` or `<sspan>` will not be detected.

Rather than using the overkill `NO_ERRORS_SCHEMA` it is more elegant including the `RouterTestingModule` instead:

```
import { RouterTestingModule } from '@angular/router/testing';

describe('HeroComponent (shallow tests)', () => {
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeroComponent],
      imports: [RouterTestingModule]            // <= added
    });
    fixture = TestBed.createComponent(HeroComponent);
  });
```

Now we can create the first simple test to check that everything is working:
```
  it('should have the correct hero', () => {
    fixture.componentInstance.hero = { id: 1, name: 'SuperDude', strength: 3};

    expect(fixture.componentInstance.hero.name).toEqual('SuperDude');
  });
```

Since we will be using `fixture.componentInstance` more often, define a global `component` which can be used with
additional tests:

```
describe('HeroComponent (shallow tests)', () => {
  let fixture: ComponentFixture<HeroComponent>;
  let component: HeroComponent;                 // <= added

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeroComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;      // <= added
  });

  it('should have the correct hero', () => {
    component.hero = { id: 1, name: 'SuperDude', strength: 3};

    expect(component.hero.name).toEqual('SuperDude');
  });
});
```

### Testing Templates with nativeElement

By using the `fixture.nativeElement` property, you can access the container of the template. which is a standard HTML
DOM element.

This offers the same API available to plain-old javascript for manipulating the DOM, for example `querySelector()`
or `querySelectorAll()`.

Adding a new test:
```
  it('should render the hero name in an anchor tag', () => {
    fixture.componentInstance.hero = { id: 1, name: 'SuperDude', strength: 3};

    expect(fixture.nativeElement.querySelector('a').textContent).toContain('SuperDude');
  })
```

Note the use of `toContain()` instead of `toEqual()` which makes the test less brittle.

Running this test results in the following Karma error:
```
Error: Expected ' ' to contain 'SuperDude'.
```

The reason that we get an empty string is because we did not tell Angular to actually implement the bindings.

The bindings for `{{hero.id}}` and `{{hero.name}}` do not get updated until change detection runs.

hero.components.html
```
<a routerLink="/detail/{{hero.id}}">
  <span class="badge">{{hero.id}}</span> {{hero.name}}      // <= bindings to be updated
</a>
<button class="delete" (click)="onDeleteClick($event)">x</button>
```

Ensure that change detection runs:
```
  it('should render the hero name in an anchor tag', () => {
    fixture.componentInstance.hero = { id: 1, name: 'SuperDude', strength: 3};
    fixture.detectChanges();        // <= added

    expect(fixture.nativeElement.querySelector('a').textContent).toContain('SuperDude');
  })
```

### Testing Templates with debugElement

Unlike the `nativeElement` which does nothing more than simply expose the underlying DOM, `debugElement` is a wrapper
around the DOM which provides a number of useful methods, e.g. `query(By.css(sel))` or `queryAll(By.directive(sel))`

```
  it('should render the hero name in an anchor tag', () => {
    fixture.componentInstance.hero = { id: 1, name: 'SuperDude', strength: 3};
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('a')).nativeElement.textContent) \\
      .toContain('SuperDude');      // <= added
  })
```

This is what the completed test should look like:

```
import { TestBed, ComponentFixture } from "@angular/core/testing";
import { HeroComponent } from "./hero.component";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { By } from "@angular/platform-browser";

describe('HeroComponent (shallow tests)', () => {
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeroComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(HeroComponent);
  });

  it('should have the correct hero', () => {
    fixture.componentInstance.hero = { id: 1, name: 'SuperDude', strength: 3};

    expect(fixture.componentInstance.hero.name).toEqual('SuperDude');
  });

  it('should render the hero name in an anchor tag', () => {
    fixture.componentInstance.hero = { id: 1, name: 'SuperDude', strength: 3};
    fixture.detectChanges();

    let deA = fixture.debugElement.query(By.css('a'));
    expect(deA.nativeElement.textContent).toContain('SuperDude');

    expect(fixture.nativeElement.querySelector('a').textContent).toContain('SuperDude');
  })
})
```

### Exercises

In the `dashboard.component.html` do the following:

1. Add a json pipe to display the Heroes array contents.
2. Open up the devtools and play around with `ng.probe($0)`. What do you see when you enter
   `ng.probe($0).componentInstance` ?
3. Install [Augury](https://augury.rangle.io) and explore the DOM structure.

Create a `app.component.spec.ts` file and test the following for `AppComponent`:

1. The module is created.
2. The correct title is displayed using the `nativeElement` property.
3. Two anchor links are displayed using the `debugElement` property.
4. The text and the anchor links are correct using both the `nativeElement` and `debugElement` properties.
5. (optional) Add an element with a new directive and use the `By.directive()` method to access it.

(Optional) Implement a Logger service.


