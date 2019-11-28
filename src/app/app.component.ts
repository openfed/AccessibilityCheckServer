import { Component } from '@angular/core';
import { ReinitService } from './services/reinit.service';
import { Toggle } from './interfaces/toggle';
import { AudienceType } from './audience';
import { AggregationAggressiveness } from './model/aggregation-aggressiveness';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showNotices: boolean = true;
  showErrors: boolean = true;
  showWarnings: boolean = true;
  audienceText: string = '';
  audience: AudienceType = AudienceType.All;
  aggressiveness: AggregationAggressiveness = AggregationAggressiveness.Minimal;

  constructor(private reinitService: ReinitService) {
    // Whenever we reinitialize, show all notices/warnings/errors again.
    reinitService.reinitializer$.subscribe(item => {
      if (item === true) {
        this.showNotices = true;
        this.showWarnings = true;
        this.showErrors = true;
      }
    });
  }

  public onAggressivenessChanged(event: AggregationAggressiveness): void {
    this.aggressiveness = event;
  }

  public onAudienceChanged(event: AudienceType): void {
    this.audience = event;
    this.audienceText = this.getAudienceText();
  }

  /** If any of the show error/warning/notice toggles change, toggle them everywhere. */
  public togglesChange(event: Toggle): void {
    if (event.errors !== undefined) {
      this.showErrors = event.errors;
    }
    if (event.warnings !== undefined) {
      this.showWarnings = event.warnings;
    }
    if (event.notices !== undefined) {
      this.showNotices = event.notices;
    }
  }

  /** Send out a reinitialization message using the Reinit service. */
  public reinitialize(event: any): void {
    this.reinitService.reinitialize();
  }

  public get aggressivenessText(): string {
    switch (this.aggressiveness) {
      case AggregationAggressiveness.Limited:
        return 'Limited Aggregation';
      case AggregationAggressiveness.VariableContent:
        return 'Variable Content Aggregation';
      case AggregationAggressiveness.RepeatedError1:
        return 'Repeated Error Aggregation 1';
      case AggregationAggressiveness.RepeatedError2:
        return 'Repeated Error Aggregation 2';
      default:
        return '';
    }
  }
  public get aggressivenessDescription(): string {
    switch (this.aggressiveness) {
      case AggregationAggressiveness.Limited:
        return 'Considered a single result when: 1. Code snippet is identical and 2. Selector is identical and 3. Success criterion and suggested technique(s) are identical.';
      case AggregationAggressiveness.VariableContent:
        return 'Considered a single result when: 1. Selector is identical and 2. Success criterion and suggested technique(s) are identical';
      case AggregationAggressiveness.RepeatedError1:
        return 'Considered a single result when: 1. Selector is identical except for the final selection level and 2. Success criterion and suggested technique(s) are identical';
      case AggregationAggressiveness.RepeatedError2:
        return 'Considered a single result when: 1. Selector is identical except for the final two selection levels and 2. Success criterion and suggested technique(s) are identical';
      default:
        return '';
    }
  }

  private getAudienceText(): string {
    switch (this.audience) {
      case AudienceType.ContentManagers:
        return 'Results filtered for: Content managers';
      case AudienceType.Developers:
        return 'Results filtered for: Developers';
      default:
        return '';
    }
  }
}
