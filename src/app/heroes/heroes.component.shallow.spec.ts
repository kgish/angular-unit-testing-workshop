import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroesComponent } from './heroes.component';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { HeroService } from '../hero.service';
import { of } from 'rxjs/internal/observable/of';
import { Hero } from '../hero';
import { By } from '@angular/platform-browser';

describe('HeroesComponent (shallow tests)', () => {
  let component: HeroesComponent;
  let fixture: ComponentFixture<HeroesComponent>;
  const mockHeroService = jasmine.createSpyObj([ 'getHeroes', 'addHero', 'deleteHero' ]);

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
    HEROES = [
      { id: 1, name: 'SpiderDude', strength: 8 },
      { id: 2, name: 'Wonderful Woman', strength: 24 },
      { id: 3, name: 'SuperDude', strength: 55 }
    ];
    TestBed.configureTestingModule({
      declarations: [
        HeroesComponent,
        FakeHeroComponent

      ],
      providers: [
        { provide: HeroService, useValue: mockHeroService } // <= Added
      ],
      // schemas: [ NO_ERRORS_SCHEMA ]
    });
    fixture = TestBed.createComponent(HeroesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set heroes correctly from the service', () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    fixture.detectChanges();

    expect(component.heroes.length).toBe(3);
  });

  it('should create one li for each hero', () => {
    mockHeroService.getHeroes.and.returnValue(of(HEROES));
    fixture.detectChanges();

    const els = fixture.debugElement.queryAll(By.css('li'));
    expect(els.length).toBe(3);
  });
});
