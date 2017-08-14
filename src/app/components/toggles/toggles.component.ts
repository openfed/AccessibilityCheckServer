import { Component, Output, OnInit, EventEmitter } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ReinitService } from '../../services/reinit.service';
import { Toggle } from '../../interfaces/toggle';

/** Component for the view error/warning/notice toggles */
@Component({
  selector: 'app-toggles',
  templateUrl: './toggles.component.html',
  styleUrls: ['./toggles.component.scss']
})
export class TogglesComponent implements OnInit {

  numErrors: number = 0;
  numWarnings: number = 0;
  numNotices: number = 0;
  show: boolean = false;

  @Output('update')
  change: EventEmitter<Toggle> = new EventEmitter<Toggle>();

  constructor(private apiService : ApiService, private reinitService: ReinitService) {}

  ngOnInit() {
    this.apiService.getAllSniffResults().subscribe(data => {
      data.result.forEach(item => {
        // Show the component as soon as the first result comes in.
        if (!this.show) {
          this.show = true;
        }
        // Update number of errors/warnings/notices.
        this.updateCounts(item);
      });
    });
    this.reinitService.reinitializer$.subscribe(item => {
      this.init();
    });
  }

  /** Called whenever we reinitialize. */
  private init() {
    // Reset state.
    this.numErrors = 0;
    this.numWarnings = 0;
    this.numNotices = 0;
    this.show = false;
  }

  /** Updates number of errors/warnings/notices. */
  private updateCounts(item) {
    if (item.type == 'error') {
      this.numErrors++;
    } else if (item.type == 'warning') {
      this.numWarnings++;
    } else if (item.type == 'notice') {
      this.numNotices++;
    }
  }

  /** Emit "toggle errors" event. */
  toggleErrors(event) {
    this.change.emit({errors: event.checked});
  }

  /** Emit "toggle warnings" event. */
  toggleWarnings(event) {
    this.change.emit({warnings: event.checked});
  }

  /** Emit "toggle notices" event. */
  toggleNotices(event) {
    this.change.emit({notices: event.checked});
  }
}
