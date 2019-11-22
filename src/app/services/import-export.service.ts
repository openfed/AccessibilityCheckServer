import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

/** This service help import/export data into the app or out of the app, so that users can save results for later viewing. */
@Injectable({
  providedIn: 'root',
})
@Injectable()
export class ImportExportService {
  /** The observable that will emit a true boolean whenever we need to reinitialize. */
  public doExport$: Observable<boolean>;
  public doImport$: Observable<string>;

  private doExportSource: Subject<boolean> = new Subject<boolean>();
  private doImportSource: Subject<string> = new Subject<string>();

  constructor() {
    this.doExport$ = this.doExportSource;
    this.doImport$ = this.doImportSource;
  }
  /** Send out a "do export" message. */
  public exportData(): void {
    this.doExportSource.next(true);
  }

  /** Send out a "do import" message with data. */
  public importData(data: any): void {
    this.doImportSource.next(data);
  }
}
