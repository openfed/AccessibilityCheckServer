import { Component,
         OnInit,
         OnChanges,
         Input,
         SimpleChanges,
         style,
         transition,
         animate,
         trigger,
         state
       } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ReinitService } from '../../services/reinit.service';
import { ImportExportService } from '../../services/import-export.service';
import { SniffList } from '../../interfaces/sniff-list';
import { ImportedData } from '../../interfaces/imported-data';
import { ItemCodeUrlResultList } from '../../interfaces/item-code-url-result-list';
import { ItemCodeUrlResult } from '../../interfaces/item-code-url-result'
import { MdSnackBar } from '@angular/material';

import 'rxjs/Rx' ;

/** Component for the list of sniffs */
@Component({
  selector: 'app-sniff-list',
  templateUrl: './sniff-list.component.html',
  styleUrls: ['./sniff-list.component.css'],
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
export class SniffListComponent implements OnInit, OnChanges {

  sniffList : SniffList = {};
  keysGetter = Object.keys;

  @Input() showNotices : boolean;
  @Input() showErrors: boolean;
  @Input() showWarnings: boolean;

  constructor(
    private apiService : ApiService,
    private reinitService : ReinitService,
    private importExportService : ImportExportService,
    public snackBar: MdSnackBar
  ) {}

  ngOnInit() {
    this.apiService.getAllSniffResults().subscribe(data => {
      data.result.forEach(item => {
        if (this.sniffList[item.code] === undefined) {
          // Initialize the array that will hold the results.
          this.sniffList[item.code] = {
            items: {},
            // Items, with errors/warnings/notices filtered out if needd.
            filteredItems: {},
            // The messages to show for this specific item code.
            codeMessages: this.apiService.getMessageInfo(item.code)
          };
        }

        // Initialize the array that will hold the sniff results.
        if (this.sniffList[item.code].items[data.url] === undefined) {
            this.sniffList[item.code].items[data.url] = <ItemCodeUrlResult[]>[];
        }

        // Add the is item to the sniff list, keyed by code and URL.
        this.sniffList[item.code].items[data.url].push(item);
        this.filterResults(item.code);
      });
    });

    // Whenever we reinitialize, empty the list of sniffs.
    this.reinitService.reinitializer$.subscribe(item => {
      if (item === true) {
        this.sniffList = {};
      }
    });

    //
    this.importExportService.doExport$.subscribe(item => {
      if (item === true) {
        const data = {
          sniffList: this.sniffList,
          version: '1.0'
        }
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const n = window.open(url, '_blank');
        if (n === null) {
          this.snackBar.open('Please whitelist this page in your ad blocker to download the export.', '', { duration : 500 });
        }
      }
    });

    this.importExportService.doImport$.subscribe(data => {
      let importedData : any;
      try {
        importedData = JSON.parse(data);
      } catch(e) {
        this.snackBar.open('Invalid data!', '', { duration : 500 });
        return;
      }
      if (importedData.version !== undefined && importedData.sniffList !== undefined) {
        this.sniffList = importedData.sniffList;
        this.snackBar.open('Imported!', '', { duration : 500 });
      } else {
        this.snackBar.open('Invalid data!', '', { duration : 500 });
      }
    });
  }

  /**
   * Filter the results for a specific code, removing notices/warnings/errors if the toggle is set to disabled.
   * @param code {string} code to filter the results for.
   */
  filterResults(code : string) : void {
    let urls = Object.keys(this.sniffList[code].items);

    urls.forEach(url => {
      if (this.sniffList[code].filteredItems[url] == undefined) {
        this.sniffList[code].filteredItems[url] = <ItemCodeUrlResult[]>[];
      }
      this.sniffList[code].filteredItems[url] = this.sniffList[code].items[url].filter(item => {
        return item.type == 'notice' && this.showNotices ||
               item.type == 'warning' && this.showWarnings ||
               item.type == 'error' && this.showErrors;
      });
      // Clean up the URL if there are no results for it.
      if (this.sniffList[code].filteredItems[url].length == 0) {
        delete this.sniffList[code].filteredItems[url];
      }
    });
  }

  /** Ensure that results are filtered again whenever "show errors/warnings/notices" is toggled. */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.showErrors !== undefined && changes.showErrors.currentValue != changes.showErrors.previousValue ||
        changes.showWarnings !== undefined && changes.showWarnings.currentValue != changes.showWarnings.previousValue ||
        changes.showNotices !== undefined && changes.showNotices.currentValue != changes.showNotices.previousValue) {
      // Get the list of message codes.
      let codes = Object.keys(this.sniffList);
      codes.forEach(code => this.filterResults(code));
    }
  }

}



