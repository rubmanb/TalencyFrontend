import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {

  private readonly _currentYear = signal<number>(new Date().getFullYear());

  readonly currentYear = this._currentYear.asReadonly();

}
