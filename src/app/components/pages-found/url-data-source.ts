import { DataSource } from '@angular/cdk';
import { Observable } from 'rxjs/Observable';
import { UrlData } from './url-data';
import { UrlDatabase } from './url-database';
import { MdPaginator } from '@angular/material';
import 'rxjs/add/observable/merge';

/** Data source class for the table */
export class UrlDataSource extends DataSource<any> {
  constructor(private _urlDatabase: UrlDatabase, private _paginator: MdPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<UrlData[]> {
    const displayDataChanges = [
      this._urlDatabase.dataChange,
      this._paginator.page,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._urlDatabase.data.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() {}
}
