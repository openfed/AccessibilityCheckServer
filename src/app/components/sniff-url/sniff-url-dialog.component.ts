import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";

/** Dialog invoked from the SniffUrlComponent. */
@Component({
  selector: "sniff-url-dialog",
  templateUrl: "./sniff-url-dialog.component.html",
  styleUrls: ["./sniff-url.component.scss"]
})
export class SniffUrlDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sanitizer: DomSanitizer
  ) {}
}
