import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import pako from 'pako';

/** This service help import/export data into the app or out of the app, so that users can save results for later viewing. */
@Injectable({
  providedIn: 'root'
})
@Injectable()
export class ImportExportService {
  /** The observable that will emit a true boolean whenever we need to reinitialize. */
  public doExport$: Observable<boolean>;
  public doGenerateCsv$: Observable<boolean>;
  public doImport$: Observable<string>;

  private doExportSource: Subject<boolean> = new Subject<boolean>();
  private doImportSource: Subject<string> = new Subject<string>();
  private doGenerateCsvSource: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.doExport$ = this.doExportSource;
    this.doImport$ = this.doImportSource;
    this.doGenerateCsv$ = this.doGenerateCsvSource;
  }
  /** Send out a "do export" message. */
  public exportData(): void {
    this.doExportSource.next(true);
  }

  /** Send out a "do import" message with data. */
  public importData(data: any): void {
    function isJson(str: any) {
      if (typeof str !== 'string') {
        return false;
      }
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
    }

    function tryUngzip(x: any) {
      try {
        const result = pako.ungzip(x, { to: 'string' });
        return result;
      }
      catch (e) {
        return x;
      }
    }

    this.doImportSource.next(isJson(data) ? data : tryUngzip(data));
  }

  public generateCsv(): void {
    this.doGenerateCsvSource.next(true);
  }
}
