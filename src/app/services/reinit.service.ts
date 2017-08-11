import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

/** Provides an observable to subscribe to which sends out a message whenever we want to reinitialize. */
@Injectable()
export class ReinitService {

  private reinitializerSource = new Subject<boolean>();

  /** The observable that will emit a true boolean whenever we need to reinitialize. */
  reinitializer$ = this.reinitializerSource.asObservable();

  /** Send out a reinitialization message. */
  reinitialize() {
    this.reinitializerSource.next(true);
  }

}
