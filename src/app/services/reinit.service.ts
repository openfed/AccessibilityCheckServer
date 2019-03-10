import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

/** Provides an observable to subscribe to which sends out a message whenever we want to reinitialize. */
@Injectable()
export class ReinitService {
  private reinitializerSource: Subject<boolean> = new Subject<boolean>();

  /** The observable that will emit a true boolean whenever we need to reinitialize. */
  reinitializer$: Observable<boolean> = this.reinitializerSource.asObservable();

  /** Send out a reinitialization message. */
  reinitialize(): void {
    this.reinitializerSource.next(true);
  }
}
