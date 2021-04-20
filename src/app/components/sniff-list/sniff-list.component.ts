import { Component, OnInit, OnChanges, Input, NgZone } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';
import { ApiService } from '../../services/api.service';
import { ReinitService } from '../../services/reinit.service';
import { SniffListService } from '../../services/sniff-list.service';
import { ImportExportService } from '../../services/import-export.service';
import { SniffList } from '../../interfaces/sniff-list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImportedData } from '../../interfaces/imported-data';
import { sniffListToCsv } from '../../functions/csv';
import pako from 'pako';
import 'rxjs/Rx';
import { AudienceType } from '../../audience';
import { AggregationAggressiveness } from '../../model/aggregation-aggressiveness';

/** Component for the list of sniffs */
@Component({
  selector: 'app-sniff-list',
  templateUrl: './sniff-list.component.html',
  styleUrls: ['./sniff-list.component.scss'],
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
export class SniffListComponent implements OnInit {
  public AggregationAggressiveness = AggregationAggressiveness;

  @Input() showNotices: boolean;
  @Input() showWarnings: boolean;
  @Input() showErrors: boolean;
  @Input() audience: AudienceType = AudienceType.All;
  @Input() aggressiveness: AggregationAggressiveness = AggregationAggressiveness.Minimal;

  private lastShowNotices: boolean;
  private lastShowWarnings: boolean;
  private lastShowErrors: boolean;
  private lastSniffList: SniffList;
  private lastAudience: string;
  private lastAggressiveness: AggregationAggressiveness;
  private cachedAggregated: SniffList;

  get sniffList(): SniffList {
    if (
      this.audience === this.lastAudience &&
      this.aggressiveness === this.lastAggressiveness &&
      this.lastSniffList === this.sniffListService.getSniffList() &&
      this.showWarnings === this.lastShowWarnings &&
      this.showNotices === this.lastShowNotices &&
      this.showErrors === this.lastShowErrors
    ) {
      return this.cachedAggregated;
    }
    const codes = Object.keys(this.sniffListService.getSniffList());
    codes.forEach(code =>
      this.sniffListService.filterResults(code, this.showNotices, this.showWarnings, this.showErrors)
    );
    this.cachedAggregated = this.sniffListService.getFilteredSniffList(this.audience, this.aggressiveness);
    this.lastSniffList = this.sniffListService.getSniffList();
    this.lastAudience = this.audience;
    this.lastAggressiveness = this.aggressiveness;
    this.lastShowErrors = this.showErrors;
    this.lastShowNotices = this.showNotices;
    this.lastShowWarnings = this.showWarnings;

    return this.cachedAggregated;
  }

  set sniffList(sniffList: SniffList) {
    this.sniffListService.setSniffList(sniffList);
  }

  public keysGetter = (x: any) => Object.keys(x).sort();

  constructor(
    private apiService: ApiService,
    private importExportService: ImportExportService,
    private sniffListService: SniffListService,
    private reinitService: ReinitService,
    public snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  public ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.apiService.getAllSniffResults().subscribe(data => {
        this.ngZone.run(() => {
          data.result.forEach(item => {
            this.sniffListService.addItem(item, data.url);
            this.sniffListService.filterResults(item.code, this.showNotices, this.showWarnings, this.showErrors);
          });
        });
      });
    });
    // Perform the export whenever "true" is emitted.
    this.importExportService.doExport$.subscribe(item => {
      if (item === true) {
        const data: ImportedData = {
          sniffList: this.sniffList,
          version: '1.0'
        };
        const gzippedJson = pako.gzip(JSON.stringify(data));
        const blob = new Blob([gzippedJson], {
          type: 'application/json; charset=x-user-defined-binary'
        });
        const url = window.URL.createObjectURL(blob);
        let a = window.document.createElement('a');
        a.href = url;
        a.download = 'export.json.gz';
        a.click();
        this.openSnackBar($localize `Data exported.`);
      }
    });


    // Perform the CSV generation whenever "true" is emitted.
    this.importExportService.doGenerateCsv$.subscribe(item => {
      if (item === true) {
        const blob = new Blob([sniffListToCsv(this.sniffList)], {
          type: 'text/csv;charset=utf-8;'
        });
        const url = window.URL.createObjectURL(blob);
        let a = window.document.createElement('a');
        a.href = url;
        const domain = Object.keys(Object.values(this.sniffList)[0].items)[0].replace('http://','').replace('https://','').split(/[/?#]/)[0].replace(/\./g, '_');
        a.download = domain + '.csv';
        a.click();
        this.openSnackBar($localize `CSV generated.`);
      }
    });

    // Perform the import whenever data is emitted.
    this.importExportService.doImport$.subscribe(data => {
      let importedData: ImportedData;
      // Attempt to parse the data.
      try {
        importedData = JSON.parse(data);
      } catch (e) {
        this.openSnackBar($localize `Invalid data!`);
        return;
      }

      if (importedData.version !== undefined && importedData.sniffList !== undefined) {
        this.sniffList = importedData.sniffList;
        this.openSnackBar($localize `Imported!`);
      } else {
        // Not a valid json file.
        this.openSnackBar($localize `Invalid data!`);
      }
    });

    // Whenever we reinitialize, empty the list of sniffs.
    this.reinitService.reinitializer$.subscribe(item => {
      if (item === true) {
        this.sniffList = {};
      }
    });
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, '', { duration: 500 });
  }
}
