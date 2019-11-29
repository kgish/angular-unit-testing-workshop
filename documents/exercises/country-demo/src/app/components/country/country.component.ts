import { Component, Input, OnInit } from '@angular/core';

import { ICountry } from '../../services/country.interface';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: [ './country.component.scss' ]
})
export class CountryComponent implements OnInit {

  @Input() country: ICountry;

  constructor() {
  }

  ngOnInit() {
  }

}
