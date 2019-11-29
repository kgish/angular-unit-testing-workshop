import { inject, TestBed } from '@angular/core/testing';
import { HeroService } from './hero.service';

import { MessageService } from './message.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('HeroService', () => {
  let mockMessageService;
  let httpTestingController: HttpTestingController;
  let heroService: HeroService;

  beforeEach(() => {
    mockMessageService = jasmine.createSpyObj(['add']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HeroService,
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    heroService = TestBed.get(HeroService);
  });

  describe('getHero', () => {

    it('should call getHero with correct URL', () => {
      heroService.getHero(4).subscribe();
    });

    // it('should call getHero with correct URL', inject([HeroService], (heroService: HeroService) => {
    //   heroService.getHero(4).subscribe();
    // }));

    // it('should call getHero with correct URL',
    //   inject([
    //       HeroService,
    //       HttpTestingController
    //     ],
    //     (
    //       heroService: HeroService,
    //       httpController: HttpTestingController
    //     ) => {
    //       heroService.getHero(4).subscribe();
    // }));
  });
});
