import { Input, Component, OnInit, Inject } from '@angular/core';
import { MdDialog } from '@angular/material';
import { SniffUrlDialogComponent } from './sniff-url-dialog.component';
import { ItemCodeUrlResultList } from '../../interfaces/item-code-url-result-list';

/** Component for listing a sniff for an individual URL with a button to view the results in a dialog. */
@Component({
  selector: 'app-sniff-url',
  templateUrl: './sniff-url.component.html',
  styleUrls: ['./sniff-url.component.scss']
})
export class SniffUrlComponent implements OnInit {

  /** Results for this URL, which will be passed on to the dialog */
  @Input() urlResults : any;
  /** The URL we are dealing with. */
  @Input() url : string;

  numErrors : number = 0;
  numWarnings : number = 0;
  numNotices : number = 0;

  constructor(public dialog: MdDialog) {}

  ngOnInit() {
    // Initialize the number of notices/warnings/errors.
    this.numNotices = this.urlResults.filter(item => item.type == 'notice').length;
    this.numWarnings = this.urlResults.filter(item => item.type == 'warning').length;
    this.numErrors = this.urlResults.filter(item => item.type == 'error').length;
  }


  /** Get a human-readable string for the number of notices/warnings/errors of this URL. */
  getStats() : string {
    let stats = [];
    if (this.numNotices == 1) {
      stats.push('1 notice');
    } else if (this.numNotices > 1) {
      stats.push(this.numNotices + ' notices');
    }

    if (this.numWarnings == 1) {
      stats.push('1 warning');
    } else if (this.numWarnings > 1) {
      stats.push(this.numWarnings + ' warnings');
    }

    if (this.numErrors == 1) {
      stats.push('1 error');
    } else if (this.numErrors > 1) {
      stats.push(this.numErrors + ' errors');
    }
    return stats.join(', ');
  }

  /** Open a dialog with the relevant data for this URL. */
  openDialog() : void {
    let info = {
      data: this.urlResults
    };
    info.data.title = this.url + " (" + this.getStats() + ")";
    this.dialog.open(SniffUrlDialogComponent, info);
  }

}
