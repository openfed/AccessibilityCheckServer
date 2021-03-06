import { Component, Output, EventEmitter, OnInit, NgZone } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';

import { PrintDialogComponent } from './print-dialog/print-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ImportedData } from '../../interfaces/imported-data';
import { ApiService } from '../../services/api.service';
import { SniffListService } from '../../services/sniff-list.service';
import { ImportExportService } from '../../services/import-export.service';
import { Observable } from 'rxjs';
import { AudienceType } from '../../audience';
import { AggregationAggressiveness } from '../../model/aggregation-aggressiveness';
import { environment } from 'environments/environment';
import { WebImportDialogComponent } from './web-import-dialog/web-import-dialog.component';

/** Component for the form with search widgets */
@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({
          opacity: 0
        }),
        animate('.1s ease-in')
      ]),
      transition('* => void', [
        animate(
          '.1s ease-out',
          style({
            opacity: 0
          })
        )
      ])
    ])
  ]
})
export class SearchFormComponent implements OnInit {
  public crawlAllowed = environment.crawlAllowed;
  /** Whether we are currently sniffing or not. */
  isSniffing: boolean = false;
  /** Whether the current state is exportable. */
  exportable: boolean = false;
  /** Whether to show advanced options. */
  advanced: boolean = false;

  /** The list of standards, retrieved from the remote server. */
  standards$: Observable<string[]>;

  /** The model for this component. */
  model = {
    // Defaults:
    url: '',
    standard: 'WCAG2AA',
    crawlDepth: '-1',
    audience: AudienceType.All,
    aggressiveness: AggregationAggressiveness.Minimal
  };

  AggregationAggressiveness = AggregationAggressiveness;

  @Output() audienceChanged: EventEmitter<AudienceType> = new EventEmitter<AudienceType>();
  @Output() aggressivenessChanged: EventEmitter<AggregationAggressiveness> = new EventEmitter<
    AggregationAggressiveness
  >();

  // Event emitter for the reinitialize event.
  @Output() onReinitialize: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private apiService: ApiService,
    private importExportService: ImportExportService,
    private sniffListService: SniffListService,
    public dialog: MatDialog,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // Find out what the standards are.
    this.standards$ = this.apiService.getStandards();

    // Toggle whether we are sniffing.
    this.ngZone.runOutsideAngular(() => {
      this.apiService.crawlStatus().subscribe(data => {
        this.ngZone.run(() => {
          if (data.status === 'started') {
            this.isSniffing = true;
            this.exportable = false;
          } else if (data.status === 'complete' || data.status === 'aborted') {
            this.isSniffing = false;
            this.exportable = true;
          }
        });
      });
    });

    this.importExportService.doImport$.subscribe(data => {
      let importedData: ImportedData;
      try {
        importedData = JSON.parse(data);
      } catch (e) {
        return;
      }

      if (importedData.version === undefined || importedData.sniffList === undefined) {
        return;
      }
      this.exportable = true;
    });
  }

  public onAggressivenessChange(event: AggregationAggressiveness): void {
    this.aggressivenessChanged.emit(event);
  }

  public onAudienceChange(event: AudienceType): void {
    this.audienceChanged.emit(event);
  }

  /** Start the crawl with the provided URL */
  sendUrl(): void {
    this.reinitialize();
    this.apiService.sendUrl(this.model.url, this.model.standard, this.model.crawlDepth);
  }

  /** Tell the backend to abort the current crawl. */
  abortAll(): void {
    this.apiService.abortAll();
  }

  /** Emit reinitialize event (with value true). */
  reinitialize(): void {
    this.onReinitialize.emit(true);
  }

  /** Emit export data event. */
  exportData(): void {
    this.importExportService.exportData();
  }

  generateCsv(): void {
    this.importExportService.generateCsv(); 
  }

  getDescription(x: string): string {
    const descriptions = {
      Section508: 'Section 508',
      WCAG2A: 'WCAG 2.1 A',
      WCAG2AA: 'WCAG 2.1 AA',
      WCAG2AAA: 'WCAG 2.1 AAA'
    };
    return descriptions[x] || x;
  }

  webImport(): void {
    this.dialog.open(WebImportDialogComponent, { minWidth: 500, minHeight: 300 });
  }

  /** Import data. */
  importData(event: any): void {
    let input = event.target;
    for (let index = 0; index < input.files.length; index++) {
      const file = input.files[index];
      let reader = new FileReader();
      reader.onload = () => {
        // this 'data' is the content of the file
        let data = reader.result;
        this.importExportService.importData(data);
      };
      file.type === 'application/x-gzip' ? reader.readAsArrayBuffer(file) : reader.readAsText(file);
    }
  }

  /** Open up a dialog with a print version. */
  printVersion(): void {
    this.dialog.open(PrintDialogComponent, {
      data: {
        // Currently not passing on the url and standard as these are not in the exports, and
        // we cannot use the values in the model either as the user may have manually changed
        // these values since the results were rendered.
        sniffList: this.sniffListService.getFilteredSniffList(this.model.audience, this.model.aggressiveness),
        audience: this.model.audience,
        aggressiveness: this.model.aggressiveness,
      }
    });
  }
}
