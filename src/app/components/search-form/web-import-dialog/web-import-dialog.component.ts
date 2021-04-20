import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { ImportExportService } from "app/services/import-export.service";
import { MatDialogRef } from "@angular/material/dialog";
import { combineLatest } from "rxjs";

export interface UrlInfo {
  crawledDomain: string;
  exportName: string;
  exportUrl: string;
  exportDate: string;
}

@Component({
  selector: "app-web-import-dialog",
  templateUrl: "./web-import-dialog.component.html",
  styleUrls: ["./web-import-dialog.component.scss"]
})
export class WebImportDialogComponent implements OnInit {
  public urls$: Observable<UrlInfo[]>;
  public loading = false;
  private search$: Subject<string> = new BehaviorSubject<string>("");
  constructor(
    private httpClient: HttpClient,
    private service: ImportExportService,
    private dialogRef: MatDialogRef<WebImportDialogComponent>
  ) {
    this.urls$ = combineLatest(
      this.httpClient.get<UrlInfo[]>(environment.urlList),
      this.search$
    ).map(([urls, search]) => {
      const x = urls.filter(
        url =>
          !search ||
          url.crawledDomain.includes(search) ||
          url.exportName.includes(search) ||
          url.exportUrl.includes(search)
      );
      return x;
    });
  }

  ngOnInit(): void {}

  public onSearchChange(value: string): void {
    this.search$.next(value);
  }

  public importFromUrl(url: string) {
    this.loading = true;
    
    this.service.importFromUrl(url).subscribe(() => {
      this.loading = false;
      this.dialogRef.close();
    });
  }

  public filename(url: string): string {
    return url.split("/").pop();
  }
}
