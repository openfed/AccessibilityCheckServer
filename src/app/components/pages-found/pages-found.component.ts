import { Component, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';

import { ApiService } from '../../services/api.service';
import { ReinitService } from '../../services/reinit.service';
import { MatPaginator } from '@angular/material/paginator';

import { UrlDatabase } from './url-database';
import { UrlDataSource } from './url-data-source';

import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

/** This component lists all the pages found by the crawler inside a Angular Material Design Table. */
@Component({
  selector: 'app-pages-found',
  templateUrl: './pages-found.component.html',
  styleUrls: ['./pages-found.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({
          opacity: 0
        }),
        animate('.2s ease-in')
      ]),
      transition('* => void', [
        animate(
          '.2s ease-out',
          style({
            opacity: 0
          })
        )
      ])
    ])
  ]
})
export class PagesFoundComponent implements OnInit, OnDestroy {
  // Flag that gives visual confirmation that we have aborted.
  isAborted: boolean = false;
  // List of crawled URLs.
  crawledUrls: string[];
  // Table info.
  dataSource: UrlDataSource | null;
  urlDatabase: UrlDatabase;
  displayedColumns: string[] = ['url', 'status'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private apiService: ApiService, private reinitService: ReinitService, private ngZone: NgZone) {}

  init(): void {
    this.urlDatabase = new UrlDatabase(this.apiService, this.ngZone);
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
    this.ngZone.runOutsideAngular(() => {
      this.apiService.crawlStatus().subscribe(data => {
        this.ngZone.run(() => {
          if (data.status === 'aborted') {
            this.isAborted = true;
          }
        });
      });
    });
  }

  ngOnDestroy() {
    // Empty the list of crawled URLs.
    this.crawledUrls = <string[]>[];
  }
}
