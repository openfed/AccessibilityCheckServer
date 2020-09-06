import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ImportExportService } from 'app/services/import-export.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: "app-web-import-dialog",
  templateUrl: "./web-import-dialog.component.html",
  styleUrls: ["./web-import-dialog.component.scss"]
})
export class WebImportDialogComponent implements OnInit {
  public urls$: Observable<string[]>;
  constructor(private httpClient: HttpClient, private service: ImportExportService, private dialogRef: MatDialogRef<WebImportDialogComponent>) {
    this.urls$ = this.httpClient
      .get(environment.urlList, {responseType: 'text'})
      .pipe(
        map((x: string) => x.split(/\r?\n/))
      );
  }

  ngOnInit(): void {}

  public importFromUrl(url: string) {
    this.httpClient
      .get(url, {responseType: 'text'})
      .subscribe((sniffList: string) => {
        this.service.importData(sniffList);
        this.dialogRef.close();
      });
  }

  public filename(url: string): string {
    return url.split('/').pop();
  }
}
