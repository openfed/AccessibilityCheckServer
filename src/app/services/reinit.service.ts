import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/** Provides an observable to subscribe to which sends out a message whenever we want to reinitialize. */
@Injectable({
  providedIn: 'root'
})
export class ReinitService {
  /** The observable that will emit a true boolean whenever we need to reinitialize. */
  public reinitializer$: Observable<boolean>;
  private reinitializerSource: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.reinitializer$ = this.reinitializerSource;
  }

  /** Send out a reinitialization message. */
  public reinitialize(): void {
    this.reinitializerSource.next(true);
  }
}
