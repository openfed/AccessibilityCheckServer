import { Component,
         OnInit,
         DoCheck,
         KeyValueDiffers,
         Input,
         style,
         transition,
         animate,
         trigger,
         state
       } from '@angular/core';
import { ItemCodeUrlResultList } from '../../interfaces/item-code-url-result-list';

/** Component for the individual sniffs. */
@Component({
  selector: 'app-sniff',
  templateUrl: './sniff.component.html',
  styleUrls: ['./sniff.component.scss'],
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
export class SniffComponent implements OnInit, DoCheck {

  @Input() code: string;
  @Input() codeMessages: string[][];
  @Input() results: ItemCodeUrlResultList;
  differ: any;

  /** Whether the current sniff is expanded or not. */
  expanded: boolean = false;

  /** Used in the template. */
  keysGetter = Object.keys;
  numNotices: number = 0;
  numWarnings: number = 0;
  numErrors: number = 0;

  constructor(private differs: KeyValueDiffers){
    this.differ = differs.find({}).create(null);
  }

  ngOnInit() {
    this.updateCount();
  }

  /** Run on DoCheck lifecycle hook as changes to this.results don't trigger OnChange (it's still the same array). */
  ngDoCheck() {
    var changes = this.differ.diff(this.results);

    if (changes) {
      this.updateCount();
    }
  }

  updateCount() {
    let numNotices = 0;
    let numWarnings = 0;
    let numErrors = 0;

    Object.keys(this.results).forEach(key => {
      numNotices += this.results[key].filter(item => item.type === 'notice').length;
      numWarnings += this.results[key].filter(item => item.type === 'warning').length;
      numErrors += this.results[key].filter(item => item.type === 'error').length;
    });

    this.numNotices = numNotices;
    this.numWarnings = numWarnings;
    this.numErrors = numErrors;
  }

  /** Returns a human-readable string with the number of notices/warnings/errors. */
  getStats(): string {
    let stats = [];
    if (this.numNotices === 1) {
      stats.push('1 notice');
    } else if (this.numNotices > 1) {
      stats.push(this.numNotices + ' notices');
    }

    if (this.numWarnings === 1) {
      stats.push('1 warning');
    } else if (this.numWarnings > 1) {
      stats.push(this.numWarnings + ' warnings');
    }

    if (this.numErrors === 1) {
      stats.push('1 error');
    } else if (this.numErrors > 1) {
      stats.push(this.numErrors + ' errors');
    }

    return stats.join(', ');
  }

  /** Returns a human-readable string with the number of pages. */
  getNumPages(): string {
    const len =  this.keysGetter(this.results).length;
    return len + ' ' + (len === 1 ? 'page' : 'pages');
  }

}
