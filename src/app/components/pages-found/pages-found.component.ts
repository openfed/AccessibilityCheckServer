import { Component,
         Output,
         OnInit,
         OnDestroy,
         EventEmitter,
         ViewChild,
         style,
         transition,
         animate,
         trigger,
         state
       } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ReinitService } from '../../services/reinit.service';
import { MdPaginator } from '@angular/material';
import { DataSource } from '@angular/cdk';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

/** This component lists all the pages found by the crawler inside a Angular Material Design Table. */
@Component({
  selector: 'app-pages-found',
  templateUrl: './pages-found.component.html',
  styleUrls: ['./pages-found.component.scss'],
  animations: [
   trigger('fadeInOut', [
      state('in', style({opacity: 1})),
      transition('void => *', [
        style({
          opacity: 0,
        }),
        animate('.2s ease-in')
      ]),
      transition('* => void', [
        animate('.2s ease-out', style({
          opacity: 0,
        }))
      ])
    ])
  ]
})
export class PagesFoundComponent implements OnInit, OnDestroy {

  // Flag that gives visual confirmation that we have aborted.
  isAborted : boolean = false;
  // List of crawled URLs.
  crawledUrls : string[];
  // Table info.
  dataSource : UrlDataSource | null;
  urlDatabase;
  displayedColumns : string[] = ['url', 'status'];
  @ViewChild(MdPaginator) paginator: MdPaginator;

  constructor(
     private apiService : ApiService,
     private reinitService: ReinitService
   ) {};

  init() {
    this.urlDatabase = new UrlDatabase(this.apiService)
    this.dataSource = new UrlDataSource(this.urlDatabase, this.paginator);
    this.isAborted = false;
  }

  ngOnInit() {
    // Intialize.
    this.init();
    this.reinitService.reinitializer$.subscribe(item => {
       if (item === true) {
         // Reinitialize.
         this.init();
       }
    });
    // Subscribe so we can know when we've aborted.
    this.apiService.crawlStatus().subscribe(data => {
      if (data.status == 'aborted') {
        this.isAborted = true;
      }
    });
  }

  ngOnDestroy() {
    // Empty the list of crawled URLs.
    this.crawledUrls = <string[]>[];
  }

}

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


export interface UrlData {
  url: string;
  status: string;
}

/** Database class that retrieves the URLs and their statuses (Queued/Loading/etc.) */
export class UrlDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<UrlData[]> = new BehaviorSubject<UrlData[]>([]);
  get data(): UrlData[] { return this.dataChange.value; }
  apiService;
  connection;

  constructor(apiService) {
    this.apiService = apiService;
    this.getUrls();
  }

  getUrls() {
    this.connection = this.apiService.getCrawledUrls().subscribe(crawledUrl => {

      const copiedData = this.data.slice();
      copiedData.push({ url : crawledUrl, status : 'Queued' });
      this.dataChange.next(copiedData);

      this.apiService.getSniffResults(crawledUrl).subscribe(data => {
        this.updateStatus(crawledUrl, 'Loaded');
      });

      this.apiService.getSniffLoading(crawledUrl).subscribe(data => {
        this.updateStatus(crawledUrl, 'Loading');
      });

      this.apiService.getSniffError(crawledUrl).subscribe(data => {
        this.updateStatus(crawledUrl, 'Error');
      });
    });
  }

  updateStatus(url, status) {
    const copiedData = this.data.slice();
    let idx = copiedData.map(function(e) { return e.url; }).indexOf(url);
    copiedData[idx].status = status;
    this.dataChange.next(copiedData);
  }
}
