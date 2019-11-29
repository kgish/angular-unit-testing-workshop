## Deep Integration Tests

In this section we dive a bit deeper and explore ways to test components with their live children. 

This is not much more difficult than what we have already been doing with the shallow integration tests.

The following topics will be covered:

* [Creating a deep integration tests](#creating-a-deep-integration-test)
* [Finding elements by directive](#finding-elements-by-directive)
* [Integration testing services](#integration-testing-services)
* [Mocked HTTP](#mocked-http)
* [Exercises](#exercises)

### Creating a Deep Integration Test

We will be creating a deep integration test for the `HeroesComponent`. The test will check the interaction between this
component and the `HeroComponent`
embedded in the template as `<app-hero></app-hero>`.

heroes.component.html
```
<h2>My Heroes</h2>
...

<ul class="heroes">
  <li *ngFor="let hero of heroes">
    <app-hero [hero]="hero" (delete)="delete(hero)"></app-hero>
  </li>
</ul>
```

First create a new test `heroes.component.deep.spec.ts`. We create a separate test file only for the purposes of
illustration, normally all of these tests (deep and shallow) would be present in the same `heroes.component.spec.ts` 
test file.

As a start, copy every thing up to and including the `beforeEach()` from the `heroes.component.shallow.spec.ts` file 
and paste it into  the `heroes.component.deep.spec.ts`` file.
 
We delete the `fakeHeroComponent` becasue we will be testing the real `HeroComponent`, including the `@Input` parameter
and the `@Output` emitter. Therefore, replace the `fakeHeroComponent` in the declarations section with `HeroComponent`.

We still do not want to use the live `HeroService` so keep the `mockHeroService` as is.

The `schemas: [ NO_ERRORS_SCHEMA ]` is no longer needed so remove that as well.

Replace `shallow` with `deep` in the describe text.

heroes.component.deep.spec.ts
```
describe('HeroesComponent (deep tests)', () => {
  let component: HeroesComponent;
  let fixture: ComponentFixture<HeroesComponent>;
  const mockHeroService = jasmine.createSpyObj([ 'getHeroes', 'addHero', 'deleteHero' ]); // <= Keep this

  let HEROES;

  beforeEach(() => {
    HEROES = [
      { id: 1, name: 'SpiderDude', strength: 8 },
      { id: 2, name: 'Wonderful Woman', strength: 24 },
      { id: 3, name: 'SuperDude', strength: 55 }
    ];
    TestBed.configureTestingModule({
      declarations: [
        HeroesComponent,
        HeroComponent                       // <= Added
      ],
      providers: [
        { provide: HeroService, useValue: mockHeroService }
      ],
    });
    fixture = TestBed.createComponent(HeroesComponent);
    component = fixture.componentInstance;
  });
});
``` 

To verify that Karma is working properly, we add a dummy 'should be true' test.

```
it('should be true', () => {
  expect(true).toBe(true);
});
```

After re-running the tests with `ng test` you will see the following error:
```
Template parse errors:
  Can't bind to 'routerLink' since it isn't a known property of 'a'. ("<a [ERROR ->]routerLink="/detail/{{hero.id}}">
  <span class="badge">{{hero.id}}</span> {{hero.name}}
  </a>
```

In the template of the `HeroComponent` it uses the `RouterLink` directive which by default is included in 
the `RouterModule`

We do not use the `RouterMoudule` in our test bed configuration which is the cause of the failed test.

In order to disable this we put back in `schemas: [ NO_ERRORS_SCHEMA ]`. The test will now succeed.

At this point, although  we aren't doing that much really, we have setup the basis of the deep integration test 
using `real` components.

In the test we wish to trigger the lifecycle of the components, e.g. `ngOnInit` etc., in order to simulate a real
environment, which is
accomplished by firing off the detect changes trigger within `beforeEach()`:

```
fixture.detectChanges();
```

Although this is only called for the parent `HeroesComponent` all children will also be called including
the `HeroComponent` child component.

We error out with the following message:

```
TypeError: Cannot read property 'subscribe' of undefined
```

because we first need to tell our `mockHeroService` that when `getHeroes()` is called within the `ngOnInit()` call,
that it should return the `HEROES` array.

```
// Must be called BEFORE detectChanges()
mockHeroService.getHeroes.and.returnValue(of(HEROES));

fixture.detectChanges();
```

Now all the test will pass again.

Our test so far doesn't do that much, so in the next section it is time to write some real tests.


### Finding Elements by Directive

Let's first check that each hero in the sample data list has been rendered out correctly. We can find the child
elements using querying by directive.

In Angular, a component is actually a subclass of a directive. It's a more specialized kind of directive. The directive 
is actually the parent class for both attribute directives like `routerLink` and components like the `HeroComponent`.

Following the principles of AAA (Arrange, Act and Assert), we move the calls to 
`mockHeroService.getHeroes.and.returnValue()` and `fixture.detectChanges()` from the `beforeEach()` section 
to the actual test.

```
it('should render each hero as a HeroComponent', () => {
  mockHeroService.getHeroes.and.returnValue(of(HEROES));

  fixture.detectChanges(); // Run ngOnInit()

  const heroComponentDEs = fixture.debugElement.queryAll(By.directive(HeroComponent));
  expect(heroComponentDEs.length).toBe(3);
});
```

Notice that the `heroComponentDEs` returned by the call to `fixture.debugElement.queryAll()` is itself an array
of `debugElements`, therefore the use of 'DE' in the variable name.

The benefits of the `debugElement` is that we can actually check one of them and see if something is correct.

Let's then take the component instance of very first debug element of the array, which is a `HeroComponent`.

Looking in the `hero.component.ts` file we see:

```
export class HeroComponent {
  @Input() hero: Hero; <= member of instance
  ...
}
``` 

Knowing this we can add the following expect to the test:

```
const firstHeroComponent = heroComponentDEs[0].componentInstance;
expect(firstHeroComponent.hero.name).toEqual('SpiderDude');
```

All tests should now be green again.

Rather than just checking that the 'name' is correct, we can also loop through the list and check that the
`HeroComponent` matches expectations:

```
for (let i = 0; i < heroComponentDEs.length; i++) {
  expect(heroComponentDEs[i].componentInstance.hero).toEqual(HEROES[i]);
}
```

We are checking that every hero property on every hero component matches up with the correct hero in the sample data
that the parent component received and passed down into the child component.

By verifying this, we are verifying that the `HeroesComponent` template and how it passes in the hero object, we're 
checking that that piece of data is set correctly and passed into the `HeroComponent` correctly.

If a developer introduces a bug that messes up the data bindings, then this test would break and immediately detect the 
problem.


### Integration Testing Services

Earlier on we saw that we could test a service using an isolated test, and since services don't have templates there 
aren't any pieces of code when testing a service that we can't reach with an isolated test.

With a component we can't actually test the template of the component, unless we're doing an integration test.

With services there is NO template, meaning that an isolated test can test 100% of the code of the service. 

The reason for writing an integration test for a service is because of the HTTP interface which is quite complex.

Have a look at the `hero.service.ts` file and you see that a number of HTTP calls are made under the hood, e.g. for the
`getHeroes()` method.
 
One possibility would be just to create a mock for the HTTP service it, however for integration testing this approach 
can become difficult to execute correctly.

Fortunately, the Angular team provides a special mock HTTP service that offers many features, with the help of the
`HttpClientTestingModule` module.

Reference: [HttpClientTestingModule](https://angular.io/guide/testing#httpclienttestingmodule)

Start by creating a minimal `hero.service.spec.ts` test file with a `beforeEach()` function for configuring the testing
module.

```
import { TestBed } from '@angular/core/testing';
import { HeroService } from './hero.service';

describe('HeroService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          HeroService
        ]
    });
  });
});
```

In the `hero.service.ts` file the constructor of the `HeroService` has the `HttpClient` and `MessageService`
services injected:

```

@Injectable()
export class HeroService {

  private heroesUrl = 'api/heroes';  // URL to web api

  constructor(private http: HttpClient,                     // <= injected service
              private messageService: MessageService) { }   // <= injected service
  ...
}
```

Starting with `MessageService` we see that this is used only once in `hero.service.ts` calling the `add` message.

```
private log(message: string) {
  this.messageService.add('HeroService: ' + message); // <= uses add
}
```

First setup a mock `MessageService` by creating a jasmine spy object supporting the `add` method and including it in
the providers sections using the longhand version.

```
describe('HeroService', () => {
  let mockMessageService;                                               // <= added

  beforeEach(() => {
    mockMessageService = jasmine.createSpyObj(['add']);                 // <= added
    TestBed.configureTestingModule({
        providers: [
          HeroService,
          { provide: MessageService, useValue: mockMessageService }     // <= added
        ]
    });
  });
});
```
 
Now we need to provide our mock HttpClient, by importing `HttpClientTestingModule`.

```
import { HttpClientTestingModule } from '@angular/common/http/testing'; // <= added

describe('HeroService', () => {

  beforeEach(() => {
    ...
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],                             // <= added
      providers: [
        ...
      ]
    });
  });
});

```

We need to get a handle to the mock HttpClient service so that we can adjust and control it inside of our test.
There's a special controller for doing this that is provided again by this same module, namely `HttpTestingController`. 

Reference: [HttpTestingController](https://angular.io/api/common/http/testing/HttpTestingController)yy

Create a new variable called `httpTestingController` and get a handle to it. 

```
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';  // <= added

describe('HeroService', () => {
  ...
  let httpTestingController: HttpTestingController;                                             // <= added

  beforeEach(() => {
    ...
    TestBed.configureTestingModule({
      ...
    });

    httpTestingController = TestBed.get(HttpTestingController);                                 // <= added
  });
});

```

Note that rather than calling `TestBed.createComponent()` as for a component, instead the `get()` method used. 

This is a special method on the TestBed that accesses the 'dependency injection registry' in order to find the service,
on success returning a handle to that service.

If you wanted to get a handle to the `HeroService` this way, create a new variable and pass in the `HeroService` type:

```
heroService = TestBed.get(HeroService);
```

or if you wanted to get a handle to the `MessageService`:

```
messageService = TestBed.get(messageService);
```

Pretty neat, don't you think?


### Mocked HTTP

Now that the testing module has been configured to test a service that uses the HttpClient, it is time to write a test for it. 

The method that we want to test is `getHero()`) located in the `hero.service.ts` file. 

This method creates a URL and then calls http using that URL. 

```
getHero(id: number): Observable<Hero> {
  const url = `${this.heroesUrl}/${id}`;
  return this.http.get<Hero>(url).pipe(
    tap(_ => this.log(`fetched hero id=${id}`)),
    catchError(this.handleError<Hero>(`getHero id=${id}`))
  );
}
```
Let's create a test to check that this methoud is called with the correct URL.

hero.service.spec.ts
```
describe('HeroService', () => {
  let heroService: HeroService;                                 // <= added

  beforeEach(() => {
    ...
    
    httpTestingController = TestBed.get(HttpTestingController);
    heroService = TestBed.get(HeroService);                     // <= added
  });

  describe('getHero', () => {                                   // <= added

    it('should call getHero with correct URL', () => {
      heroService.getHero(4).subscribe();
    });
  });
});
```

Another way to handle this is to use a special inject function that is provided by Angular, that is used as a wrapper for the it test callback. 

Instead of passing in an empty function, we can call `inject` imported from `@angular/core/testing`. 

```
it('should call getHero with correct URL', inject([HeroService], (heroService: HeroService) => {
  heroService.getHero(4).subscribe();
}));
```

Using the same mechanism to inject the `httpTestingController` also, we have:

```
it('should call getHero with correct URL',
  inject([
    HeroService,
    HttpTestingController
  ],
  (
    heroService: HeroService,
    httpController: HttpTestingController
  ) => {
    heroService.getHero(4).subscribe();
}));
```

This second format quickly becomes cumbersome and more difficult to read, therefore we chhose the previous simpler `TestBed.get()` format instead.


The real HTTP is not being called, but rather Angular's testing module which creates a mock HttpClient service behind the scenes. 

5:15

Now before we write our expectations, let's go back to these two methods of getting handles to services. We can use the inject function or we can use TestBed. get. The TestBed. get method is a little bit cleaner. You can see how using the inject function has made the code here inside of the it a little bit difficult to read, you kind of have to visually in your mind line them up. To make them easier to read we would probably put everything on its line. And that just makes the whole thing really, really long. Now all of the sudden our test takes a lot of lines of code. So in my opinion it's a little bit better to use the get method instead. So let's delete this code here, and this code here, we'll comment this back in, and we'll create that service, get a handle to the HeroService, and add a variable for it, and then a callback function inside of our it, and now we have a handle to the service, and we also have a handle to the HttpTestingController that we can use, and that's what we'll use to create our expectations. So the HttpTestingController and the test HttpClient are a little interesting in how they work. We have called service. getHero, which under the hood on that HeroService is going to call Http. get. So we need to tell the mock HttpClient that it should expect a call to a certain URL. In this case, if we pass in a 4 the URL is going to be whatever the heroesUrl is, then a slash, then the id. If we want to see what the heroesUrl is, we come up here and we see that it's api/heroes. So the resulting URL is going to be api/heroes/4. So we could tell the HTTP mock client using the httpTestingController, and this is the instance variable here, that we are expecting a call. And we call expectOne, and then we give it the URL, which is api/heroes/4, and that will create a request. Then we can tell the mock HttpClient that Angular has created for us what data we want to return when this call comes in. Using the request object we can say req. flush, and then we set whatever data we want to come back. In this case, it's sending back a hero, so let's just send back an object with an id of 4 that matches the id we requested, a name of SuperDude, and a strength of 100. And that will actually send back that data when it sees that request. Now notice that we told the mock client to expect that call after we actually made the call. Up here on line 30, we call getHero, which actually calls Http. get, but it's not until afterwards on line 32 that we tell it to expect a call. And then later on, on line 33, we actually tell it what to send back. So it's not until we hit line 33 that that request, that observable, actually receives a value. So if we were to put some kind of a callback function up here in subscribe, and log out to the console, like fulfilled, to say that the observable got a value back, this console. log statement won't execute until after the flush is executed on line 35. It's a good thing to note the order of how things are executed when using this mock Http. Now let's undo all this change here. And we can save this test and go over to Karma and see what the results are. And we can see that our tests are all green. There's our getHero test. It's green and it's passing, but also, if we were to comment out this line of code and do nothing, go back, now we see that it's failing because it is expecting one matching request. So we are verifying that we are making the call that we requested. So we'll comment that back in, and that will make the test pass. Now let's fiddle around with this just a tiny bit. What happens if we accidentally make two calls? What if our HeroService is actually calling http. get two, or three, or four times? We can simulate that by just making the call twice. We'll save that and go over to Karma, and we're getting a failure. It was expecting one matching request, but it did find two requests. So we get a failure if it's not calling that URL exactly once. But what if it calls a different URL? What if we call api/hero/3 after we call api/hero/4? Make that change, and our test is passing. So technically this wouldn't be correct if our HeroService was accidentally making two calls, one to the correct URL and then one to an incorrect URL, the test would still show that it's passing, but there is a way for us to actually address this. And that is a special method on the controller, which is verify. And that verifies that we only got exactly what we expected. So save that change, go back to Karma, and we're getting a failure because it expected no open requests when it was done, but it found api/hero/3. So we can get our test back to a passing state by killing this extra request. Save that, go back to Karma, and all of our tests are green. So that's how we can test a service using an integration test, and how we can use the httpTestingController in order to set expected requests, respond to those requests, and verify that no unexpected requests were made.



Todo.

### Exercises

Todo.


