import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';


/** This service help import/export data into the app or out of the app. */
@Injectable()
export class MigrateService {

  private doExportSource = new Subject<boolean>();
  private doImportSource = new Subject<ImportedData>();

  /** The observable that will emit a true boolean whenever we need to reinitialize. */
  doExport$ = this.doExportSource.asObservable();
  doImport$ = this.doImportSource.asObservable();

  /** Send out a "do export" message. */
  exportData() {
    console.log('exporting');
    this.doExportSource.next(true);
  }

  /** Send out a "do import" message with data. */
  importData(data) {
    const importedData : ImportedData = JSON.parse(data);
    this.doImportSource.next(importedData);
  }

}

interface ImportedData {
  version: string,
  sniffList: any
}
