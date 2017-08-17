import { Component } from '@angular/core';
import { ApiService } from './services/api.service';
import { ReinitService } from './services/reinit.service';
import { Toggle } from './interfaces/toggle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    ApiService,
    ReinitService
  ]
})
export class AppComponent {

  showNotices: boolean = true;
  showErrors: boolean = true;
  showWarnings: boolean = true;

  constructor(private reinitService: ReinitService) {

    // Whenever we reinitialize, show all notices/warnings/errors again.
    reinitService.reinitializer$.subscribe(
      item => {
        if (item === true) {
          this.showNotices = true;
          this.showWarnings = true;
          this.showErrors = true;
        }
      }
    );
  }

  /** If any of the show error/warning/notice toggles change, toggle them everywhere. */
  togglesChange(event: Toggle): void {
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
  reinitialize(event: any): void {
    this.reinitService.reinitialize();
  }
}
