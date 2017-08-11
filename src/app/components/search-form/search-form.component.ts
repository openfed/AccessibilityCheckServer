import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs/Observable';

/** Component for the form with search widgets */
@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent {
  /** Whether we are currently sniffing or not. */
  isSniffing: boolean = false;

  /** The list of standards, retrieved from the remote server. */
  standards$ : Observable<string[]>;

  /** The model for this component. */
  model = {
    // Defaults:
    url: '',
    standard: 'WCAG2AA',
    crawlDepth: '-1'
  };

  // Event emitter for the reinitialize event.
  @Output() onReinitialize: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    // Find out what the standards are.
    this.standards$ = this.apiService.getStandards();

    // Toggle whether we are sniffing.
    this.apiService.crawlStatus().subscribe(data => {
      if (data.status == 'started') {
        this.isSniffing = true;
      }
      else if (data.status == 'complete' || data.status == 'aborted') {
        this.isSniffing = false;
      }
    });
  }

  /** Start the crawl with the provided URL */
  sendUrl() : void {
    this.reinitialize();
    this.apiService.sendUrl(this.model.url, this.model.standard, this.model.crawlDepth);
  }

  /** Tell the backend to abort the current crawl. */
  abortAll() : void {
    this.apiService.abortAll();
  }

  reinitialize() : void {
    // Emit reinitialize event (with value true).
    this.onReinitialize.emit(true);
  }
}
