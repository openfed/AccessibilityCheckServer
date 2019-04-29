import { Component, Output, OnInit, EventEmitter, NgZone, Input } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { ReinitService } from "../../services/reinit.service";
import { ImportExportService } from "../../services/import-export.service";
import { Toggle } from "../../interfaces/toggle";
import { ItemCodeUrlResult } from "../../interfaces/item-code-url-result";
import { ImportedData } from "../../interfaces/imported-data";
import { AudienceType } from '../../audience';
import { isDevOnlySniff, isCmOnlySniff } from '../../audience.functions';

/** Component for the view error/warning/notice toggles */
@Component({
  selector: "app-toggles",
  templateUrl: "./toggles.component.html",
  styleUrls: ["./toggles.component.scss"]
})
export class TogglesComponent implements OnInit {

  /** Whether to show the current component. */
  public show: boolean = false;

  /** The number of notices / errors / warnings. */
  private numDevNotices: number = 0;
  private numDevWarnings: number = 0;
  private numDevErrors: number = 0;

  private numCmNotices: number = 0;
  private numCmWarnings: number = 0;
  private numCmErrors: number = 0;

  private numAllNotices: number = 0;
  private numAllWarnings: number = 0;
  private numAllErrors: number = 0;

  @Input()
  private audience: AudienceType = AudienceType.All;

  @Output("update")
  private change: EventEmitter<Toggle> = new EventEmitter<Toggle>();

  public get numErrors(): number {
    if (this.audience === AudienceType.All) {
      return this.numAllErrors;
    } else if (this.audience === AudienceType.ContentManagers) {
      return this.numCmErrors;
    } else if (this.audience === AudienceType.Developers) {
      return this.numDevErrors;
    }
  }

  public get numWarnings(): number {
    if (this.audience === AudienceType.All) {
      return this.numAllWarnings;
    } else if (this.audience === AudienceType.ContentManagers) {
      return this.numCmWarnings;
    } else if (this.audience === AudienceType.Developers) {
      return this.numDevWarnings;
    }
  }

  public get numNotices(): number {
    if (this.audience === AudienceType.All) {
      return this.numAllNotices;
    } else if (this.audience === AudienceType.ContentManagers) {
      return this.numCmNotices;
    } else if (this.audience === AudienceType.Developers) {
      return this.numDevNotices;
    }
  }

  constructor(
    private apiService: ApiService,
    private reinitService: ReinitService,
    private importExportService: ImportExportService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.apiService.getAllSniffResults().subscribe(data => {
        this.ngZone.run(() => {
          data.result.forEach(item => {
            // Show the component as soon as the first result comes in.
            if (!this.show) {
              this.show = true;
            }
            // Update number of errors/warnings/notices.
            this.updateCounts(item);
          });
        });
      });
    });

    this.reinitService.reinitializer$.subscribe(item => {
      this.init();
    });

    this.importExportService.doImport$.subscribe(data => {
      let importedData: ImportedData;
      try {
        importedData = JSON.parse(data);
      } catch (e) {
        return;
      }

      if (
        importedData.version === undefined ||
        importedData.sniffList === undefined
      ) {
        return;
      }

      this.init();
      this.show = true;
      const sniffList = importedData.sniffList;
      Object.keys(sniffList).forEach(code => {
        Object.keys(sniffList[code].items).forEach(url => {
          sniffList[code].items[url].forEach(item => {
            this.updateCounts(item);
          });
        });
      });
    });
  }

  /** Emit "toggle errors" event. */
  toggleErrors(event): void {
    this.change.emit({ errors: event.checked });
  }

  /** Emit "toggle warnings" event. */
  toggleWarnings(event): void {
    this.change.emit({ warnings: event.checked });
  }

  /** Emit "toggle notices" event. */
  toggleNotices(event): void {
    this.change.emit({ notices: event.checked });
  }

  /** Called whenever we reinitialize. */
  private init(): void {
    // Reset state.
    this.numDevErrors = 0;
    this.numDevWarnings = 0;
    this.numDevNotices = 0;

    this.numCmErrors = 0;
    this.numCmWarnings = 0;
    this.numCmNotices = 0;

    this.numAllErrors = 0;
    this.numAllWarnings = 0;
    this.numAllNotices = 0;

    this.show = false;
  }

  /** Updates number of errors/warnings/notices. */
  private updateCounts(item: ItemCodeUrlResult): void {
    const isDevOnlyResult = isDevOnlySniff(item.code);
    const isCmOnlyResult = isCmOnlySniff(item.code);

    if (item.type === "error") {
      this.numAllErrors++;
      if (!isDevOnlyResult) {
        this.numCmErrors++;
      }
      if (!isCmOnlyResult) {
        this.numDevErrors++;
      }
    } else if (item.type === "warning") {
      this.numAllWarnings++;
      if (!isDevOnlyResult) {
        this.numCmWarnings++;
      }
      if (!isCmOnlyResult) {
        this.numDevWarnings++;
      }
    } else if (item.type === "notice") {
      this.numAllNotices++;
      if (!isDevOnlyResult) {
        this.numCmNotices++;
      }
      if (!isCmOnlyResult) {
        this.numDevNotices++;
      }
    }
  }
}
