import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  NgZone
} from "@angular/core";
import {
  trigger,
  state,
  transition,
  animate,
  style
} from "@angular/animations";

import { ApiService } from "../../services/api.service";
import { ReinitService } from "../../services/reinit.service";
import { SniffListService } from "../../services/sniff-list.service";
import { ImportExportService } from "../../services/import-export.service";
import { SniffList } from "../../interfaces/sniff-list";
import { ItemCodeUrlResultList } from "../../interfaces/item-code-url-result-list";
import { ItemCodeUrlResult } from "../../interfaces/item-code-url-result";
import { MatSnackBar } from "@angular/material";
import { ImportedData } from "../../interfaces/imported-data";

import "rxjs/Rx";
import { AudienceType } from '../../audience';

/** Component for the list of sniffs */
@Component({
  selector: "app-sniff-list",
  templateUrl: "./sniff-list.component.html",
  styleUrls: ["./sniff-list.component.scss"],
  animations: [
    trigger("fadeInOut", [
      state("in", style({ opacity: 1 })),
      transition("void => *", [
        style({
          opacity: 0
        }),
        animate(".2s ease-in")
      ]),
      transition("* => void", [
        animate(
          ".2s ease-out",
          style({
            opacity: 0
          })
        )
      ])
    ])
  ]
})
export class SniffListComponent implements OnInit, OnChanges {

  get sniffList(): SniffList {
    return this.sniffListService.getAudienceFilteredSniffList(this.audience);
  }

  set sniffList(sniffList: SniffList) {
    this.sniffListService.setSniffList(sniffList);
  }

  @Input() showNotices: boolean;
  @Input() showWarnings: boolean;
  @Input() showErrors: boolean;
  @Input() audience: AudienceType = AudienceType.All;

  public keysGetter = (x: any) => Object.keys(x).sort();

  constructor(
    private apiService: ApiService,
    private importExportService: ImportExportService,
    private sniffListService: SniffListService,
    private reinitService: ReinitService,
    public snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  public ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.apiService.getAllSniffResults().subscribe(data => {
        this.ngZone.run(() => {
          data.result.forEach(item => {
            this.sniffListService.addItem(item, data.url);
            this.sniffListService.filterResults(
              item.code,
              this.showNotices,
              this.showWarnings,
              this.showErrors
            );
          });
        });
      });
    });
    // Perform the export whenever "true" is emitted.
    this.importExportService.doExport$.subscribe(item => {
      if (item === true) {
        const data: ImportedData = {
          sniffList: this.sniffList,
          version: "1.0"
        };
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json"
        });
        const url = window.URL.createObjectURL(blob);
        let a = window.document.createElement("a");
        a.href = url;
        a.download = "export.json";
        a.click();
        this.openSnackBar("Data exported.");
      }
    });

    // Perform the import whenever data is emitted.
    this.importExportService.doImport$.subscribe(data => {
      let importedData: ImportedData;
      // Attempt to parse the data.
      try {
        importedData = JSON.parse(data);
      } catch (e) {
        this.openSnackBar("Invalid data!");
        return;
      }

      if (
        importedData.version !== undefined &&
        importedData.sniffList !== undefined
      ) {
        this.sniffList = importedData.sniffList;
        this.openSnackBar("Imported!");
      } else {
        // Not a valid json file.
        this.openSnackBar("Invalid data!");
      }
    });

    // Whenever we reinitialize, empty the list of sniffs.
    this.reinitService.reinitializer$.subscribe(item => {
      if (item === true) {
        this.sniffList = {};
      }
    });
  }

  /** Ensure that results are filtered again whenever "show errors/warnings/notices" is toggled. */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes.showErrors !== undefined &&
        changes.showErrors.currentValue !== changes.showErrors.previousValue) ||
      (changes.showWarnings !== undefined &&
        changes.showWarnings.currentValue !==
          changes.showWarnings.previousValue) ||
      (changes.showNotices !== undefined &&
        changes.showNotices.currentValue !== changes.showNotices.previousValue)
    ) {
      // Get the list of message codes.
      let codes = Object.keys(this.sniffList);
      codes.forEach(code =>
        this.sniffListService.filterResults(
          code,
          this.showNotices,
          this.showWarnings,
          this.showErrors
        )
      );
    }
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, "", { duration: 500 });
  }
}
