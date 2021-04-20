import { UrlData } from './url-data';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { NgZone } from '@angular/core';

/** Database class that retrieves the URLs and their statuses (Queued/Loading/etc.) */
export class UrlDatabase {
  /** Stream that emits whenever the data has been modified. */
  dataChange: BehaviorSubject<UrlData[]> = new BehaviorSubject<UrlData[]>([]);
  get data(): UrlData[] {
    return this.dataChange.value;
  }

  constructor(private apiService: ApiService, private ngZone: NgZone) {
    this.apiService = apiService;
    this.ngZone = ngZone;
    this.getUrls();
  }

  getUrls(): void {
    this.ngZone.runOutsideAngular(() => {
      this.apiService.getCrawledUrls().subscribe(crawledUrl => {
        this.ngZone.run(() => {
          const copiedData = this.data.slice();
          copiedData.push({ url: crawledUrl, status: 'Queued' });
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
      });
    });
  }

  updateStatus(url: string, status: string): void {
    const copiedData = this.data.slice();
    let idx = copiedData
      .map(function(e) {
        return e.url;
      })
      .indexOf(url);
    copiedData[idx].status = status;
    this.dataChange.next(copiedData);
  }
}
