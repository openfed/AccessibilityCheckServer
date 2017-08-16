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
import { SniffListService } from '../../services/sniff-list.service';
import { ImportExportService } from '../../services/import-export.service';
import { SniffList } from '../../interfaces/sniff-list';
import { ItemCodeUrlResultList } from '../../interfaces/item-code-url-result-list';
import { ItemCodeUrlResult } from '../../interfaces/item-code-url-result'
import { MdSnackBar } from '@angular/material';
import { ImportedData } from '../../interfaces/imported-data';

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

  keysGetter = Object.keys;

  get sniffList(): SniffList {
    return this.sniffListService.getSniffList();
  }

  set sniffList(sniffList : SniffList) {
    this.sniffListService.setSniffList(sniffList);
  }

  @Input() showNotices : boolean;
  @Input() showWarnings: boolean;
  @Input() showErrors: boolean;

  constructor(
    private apiService : ApiService,
    private importExportService : ImportExportService,
    private sniffListService : SniffListService,
    public snackBar: MdSnackBar
  ) {}

  ngOnInit() {
    this.apiService.getAllSniffResults().subscribe(data => {
      data.result.forEach(item => {
        this.sniffListService.addItem(item, data.url);
        this.sniffListService.filterResults(item.code, this.showNotices, this.showWarnings, this.showErrors);
      });
    });


    // Perform the export whenever "true" is emitted.
    this.importExportService.doExport$.subscribe(item => {
      if (item === true) {
        const data : ImportedData = {
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

    // Perform the import whenever data is emitted.
    this.importExportService.doImport$.subscribe(data => {
      let importedData : ImportedData;
      // Attempt to parse the data.
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
        // Not a valid json file.
        this.snackBar.open('Invalid data!', '', { duration : 500 });
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
      codes.forEach(code => this.sniffListService.filterResults(code, this.showNotices, this.showWarnings, this.showErrors));
    }
  }

}



