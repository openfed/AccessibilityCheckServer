import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';


/** This service help import/export data into the app or out of the app, so that users can save results for later viewing. */
@Injectable()
export class ImportExportService {

  private doExportSource = new Subject<boolean>();
  private doImportSource = new Subject<string>();

  /** The observable that will emit a true boolean whenever we need to reinitialize. */
  doExport$ = this.doExportSource.asObservable();
  doImport$ = this.doImportSource.asObservable();

  /** Send out a "do export" message. */
  exportData() {
    this.doExportSource.next(true);
  }

  /** Send out a "do import" message with data. */
  importData(data) {
    this.doImportSource.next(data);
  }

}
