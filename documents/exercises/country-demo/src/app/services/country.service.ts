import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ICountry } from './country.interface';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private api = 'https://restcountries.eu/rest/v2';

  constructor( private http: HttpClient ) { }

  getAll(): Observable<ICountry[]> {
    const url = `${this.api}/all`;
    return this.http.get<ICountry[]>(url);
  }
}
