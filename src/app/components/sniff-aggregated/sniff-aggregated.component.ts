import { Component, OnInit, DoCheck, KeyValueDiffers, Input } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';

import { AggregatedResults } from '../../interfaces/item-code-result-list';

/** Component for the individual sniffs. */
@Component({
  selector: 'app-sniff-aggregated',
  templateUrl: './sniff-aggregated.component.html',
  styleUrls: ['./sniff-aggregated.component.scss'],
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
export class SniffAggregatedComponent implements OnInit, DoCheck {
  @Input() code: string;
  @Input() codeMessages: string[][];
  @Input() results: AggregatedResults;
  differ: any;

  /** Whether the current sniff is expanded or not. */
  expanded: boolean = false;

  /** Used in the template. */
  keysGetter = Object.keys;
  numNotices: number = 0;
  numWarnings: number = 0;
  numErrors: number = 0;

  constructor(differs: KeyValueDiffers) {
    this.differ = differs.find({}).create();
  }

  ngOnInit(): void {
    this.updateCount();
  }

  /** Run on DoCheck lifecycle hook as changes to this.results don't trigger OnChange (it's still the same array). */
  ngDoCheck(): void {
    const changes = this.differ.diff(this.results);

    if (changes) {
      this.updateCount();
    }
  }

  topOnly(): boolean {
    return (
      Object.keys(this.results)
        .map(key => this.results[key])
        .map(item => (item.result.selector !== '' ? 1 : 0))
        .reduce((cur, x) => cur + x, 0) === 0
    );
  }

  updateCount(): void {
    let numNotices = 0;
    let numWarnings = 0;
    let numErrors = 0;

    Object.keys(this.results).forEach(key => {
      numNotices += this.results[key].result.type === 'notice' ? 1 : 0;
      numWarnings += this.results[key].result.type === 'warning' ? 1 : 0;
      numErrors += this.results[key].result.type === 'error' ? 1 : 0;
    });

    this.numNotices = numNotices;
    this.numWarnings = numWarnings;
    this.numErrors = numErrors;
  }

  /** Returns a human-readable string with the number of notices/warnings/errors. */
  getStats(): string {
    let stats = [];
    if (this.numNotices > 0) {
      stats.push('Notice');
    }

    if (this.numWarnings > 0) {
      stats.push('Warning');
    }

    if (this.numErrors > 0) {
      stats.push('Error');
    }

    return stats.join(', ');
  }

  /** Returns a human-readable string with the number of pages. */
  getNumPages(): string {
    return 'N/A';
  }
}
