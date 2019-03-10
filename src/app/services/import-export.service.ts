import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

/** This service help import/export data into the app or out of the app, so that users can save results for later viewing. */
@Injectable()
export class ImportExportService {
  private doExportSource: Subject<boolean> = new Subject<boolean>();
  private doImportSource: Subject<string> = new Subject<string>();

  /** The observable that will emit a true boolean whenever we need to reinitialize. */
  doExport$: Observable<boolean> = this.doExportSource.asObservable();
  doImport$: Observable<string> = this.doImportSource.asObservable();

  /** Send out a "do export" message. */
  exportData(): void {
    this.doExportSource.next(true);
  }

  /** Send out a "do import" message with data. */
  importData(data: any): void {
    this.doImportSource.next(data);
  }
}
