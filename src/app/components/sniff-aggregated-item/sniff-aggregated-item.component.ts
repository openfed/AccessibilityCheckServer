import { Input, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AggregatedResult } from '../../interfaces/item-code-result-list';
import { SniffUrlDialogComponent } from '../sniff-url/sniff-url-dialog.component';

/** Component for listing a sniff for an individual URL with a button to view the results in a dialog. */
@Component({
  selector: 'app-sniff-aggregated-item',
  templateUrl: './sniff-aggregated-item.component.html',
  styleUrls: ['./sniff-aggregated-item.component.scss']
})
export class SniffAggregatedItemComponent implements OnInit {
  /** Results for this URL, which will be passed on to the dialog */
  @Input() result: AggregatedResult;

  numNotices: number = 0;
  numWarnings: number = 0;
  numErrors: number = 0;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    // Initialize the number of notices/warnings/errors.
    this.numNotices = this.result.result.type === 'notice' ? 1 : 0;
    this.numWarnings = this.result.result.type === 'warning' ? 1 : 0;
    this.numErrors = this.result.result.type === 'error' ? 1 : 0;
  }

  /** Get a human-readable string for the number of notices/warnings/errors of this URL. */
  getStats(): string {
    let stats = [];
    if (this.numNotices === 1) {
      stats.push($localize `Notice`);
    }

    if (this.numWarnings === 1) {
      stats.push($localize `Warning`);
    }

    if (this.numErrors === 1) {
      stats.push($localize `Error`);
    }
    stats.push('detected on ' + this.result.numResults + (this.result.numResults === 1 ? ' page' : ' pages'));
    if (this.result.averageOccurrencesPerPage) {
      stats.push($localize `average per page` + `: ${this.result.averageOccurrencesPerPage}`);
    }
    return stats.join(', ');
  }

  /** Open a dialog with the relevant data for this URL. */
  openDialog(): void {
    let info = {
      data: {
        items: [this.result.result],
        title: this.getStats()
      }
    };
    this.dialog.open(SniffUrlDialogComponent, info);
  }
}
