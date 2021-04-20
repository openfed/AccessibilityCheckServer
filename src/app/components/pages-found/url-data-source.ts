import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { UrlData } from './url-data';
import { UrlDatabase } from './url-database';
import { MatPaginator } from '@angular/material/paginator';
import 'rxjs/add/observable/merge';

/** Data source class for the table */
export class UrlDataSource extends DataSource<any> {
  constructor(private _urlDatabase: UrlDatabase, private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<UrlData[]> {
    const displayDataChanges = [this._urlDatabase.dataChange, this._paginator.page];

    return Observable.merge(...displayDataChanges).map(() => {
      const data = this._urlDatabase.data.slice();

      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect(): void {}
}
