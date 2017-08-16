import { Component,
         Input,
         Output,
         EventEmitter,
         OnInit,
         OnDestroy,
         style,
         transition,
         animate,
         trigger,
         state
      } from '@angular/core';
import { PrintDialogComponent } from './print-dialog.component';
import { MdDialog } from '@angular/material';
import { ApiService } from '../../services/api.service';
import { SniffListService } from '../../services/sniff-list.service';
import { ImportExportService } from '../../services/import-export.service';
import { Observable } from 'rxjs/Observable';

/** Component for the form with search widgets */
@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css'],
  animations: [
   trigger('fadeInOut', [
      state('in', style({opacity: 1})),
      transition('void => *', [
        style({
          opacity: 0,
        }),
        animate('.1s ease-in')
      ]),
      transition('* => void', [
        animate('.1s ease-out', style({
          opacity: 0,
        }))
      ])
    ])
  ]
})
export class SearchFormComponent {
  /** Whether we are currently sniffing or not. */
  isSniffing: boolean = false;
  /** Whether the current state is exportable. */
  exportable: boolean = false;
  /** Whether to show advanced options. */
  advanced: boolean = false;

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

  constructor(
    private apiService: ApiService,
    private importExportService: ImportExportService,
    private sniffListService: SniffListService,
    public dialog: MdDialog
  ) { }

  ngOnInit() {
    // Find out what the standards are.
    this.standards$ = this.apiService.getStandards();

    // Toggle whether we are sniffing.
    this.apiService.crawlStatus().subscribe(data => {
      if (data.status == 'started') {
        this.isSniffing = true;
        this.exportable = false;
      }
      else if (data.status == 'complete' || data.status == 'aborted') {
        this.isSniffing = false;
        this.exportable = true;
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

  exportData() : void {
    this.importExportService.exportData();
  }

  importData(event) : void {
    let input = event.target;
    for (var index = 0; index < input.files.length; index++) {
        let reader = new FileReader();
        reader.onload = () => {
            // this 'data' is the content of the file
            var data = reader.result;
            this.importExportService.importData(data);
        }
        reader.readAsText(input.files[index]);
    };
  }

  printVersion() {
    this.dialog.open(PrintDialogComponent, {
      data : {
        url: this.model.url,
        standard: this.model.standard,
        sniffList : this.sniffListService.getSniffList()
      }
    });
  }

}
