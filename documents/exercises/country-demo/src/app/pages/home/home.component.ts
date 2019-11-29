import { Component, OnInit } from '@angular/core';
import { CountryService } from '../../services/country.service';
import { ICountry } from '../../services/country.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  allCountries: ICountry[] = [];
  filteredCountries: ICountry[] = [];

  loading = false;

  letters: string[];
  letter: string;
  population: number;

  constructor(private countryService: CountryService) {
  }

  ngOnInit() {
    this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWYZ'.split('');
    this.population = 0;
    this.loading = true;
    this.countryService.getAll().subscribe(
      c => {
        this.allCountries = c;
        this.filterCountries('');
      },
      error => console.error(error),
      () => this.loading = false
    );
  }

  filterCountries(ch: string) {
    if (ch === '') {
      this.filteredCountries = this.allCountries;
    } else {
      this.filteredCountries = this.allCountries.filter(country => country.name[0] === ch);
    }
    this.letter = ch;
  }

  togglePopulation() {
    if (this.population === 0) {
      this.population = 1;
      this.filteredCountries = this.filteredCountries.sort(this._comparePopulation);
    } else if (this.population === 1) {
      this.filteredCountries = this.filteredCountries.sort(this._comparePopulation).reverse();
      this.population = 2;
    } else {
      this.population = 0;
      this.filterCountries(this.letter);
    }
  }

  _comparePopulation(a: ICountry, b: ICountry): number {
    if (a.population > b.population) {
      return -1;
    } else if (a.population < b.population) {
      return 1;
    } else {
      return 0;
    }
  }
}
