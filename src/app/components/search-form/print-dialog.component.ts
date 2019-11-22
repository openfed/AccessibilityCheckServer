import { Component, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SafeHtml } from '@angular/platform-browser';
import { AudienceType } from '../../audience';

/** Dialog invoked from the SniffUrlComponent. */
@Component({
  selector: 'print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class PrintDialogComponent {
  /** srcdoc contents of the iframe */
  iframeHtml: SafeHtml;

  /** Initialize the html contents of the iframe. */
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private sanitizer: DomSanitizer) {
    let html: string = '<h1>Accessibility check results</h1>';
    if (this.data.audience === AudienceType.Developers) {
      html += '<h2>Results filtered for: Developers</h2>';
    } else if (this.data.audience === AudienceType.ContentManagers) {
      html += '<h2>Results filtered for: Content Managers</h2>';
    }
    Object.keys(this.data.sniffList)
      .sort()
      .forEach(result => {
        if (Object.keys(this.data.sniffList[result].filteredItems).length === 0) {
          return;
        }
        html += '<div style="padding: 10px; border: 1px solid #000">';
        html +=
          '<div style="margin-bottom: 10px;">' +
          this.stripHtml(this.data.sniffList[result].codeMessages[0][0]) +
          ': ' +
          this.stripHtml(this.data.sniffList[result].codeMessages[0][1]) +
          '</div>';
        if (this.data.sniffList[result].codeMessages[1] !== undefined) {
          html +=
            '<div style="margin-bottom: 10px;">' +
            this.stripHtml(this.data.sniffList[result].codeMessages[1][0]) +
            ': ' +
            this.stripHtml(this.data.sniffList[result].codeMessages[1][1]) +
            '</div>';
        }
        Object.keys(this.data.sniffList[result].filteredItems).forEach(url => {
          html += '<div style="padding: 10px; border: 1px solid #000">';
          html += '<h3>' + this.escapeHtml(url) + '</h3>';
          this.data.sniffList[result].filteredItems[url].forEach(item => {
            html += '<div style="padding: 10px; border: 1px solid #000">';
            html += '<p>' + this.capitalizeFirstLetter(this.escapeHtml(item.type)) + ': ' + item.message + '</em></p>';
            if (item.context) {
              html += '<p>Code snippet: <pre>' + this.escapeHtml(item.context) + '</pre></p>';
            }
            if (item.selector) {
              html += '<p>Selector: <pre>' + this.escapeHtml(item.selector) + '</pre></p>';
            }
            html += '</div>';
          });
          html += '</div>';
        });
        html += '</div>';
      });
    this.iframeHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /** Callback for the print button. */
  print(): void {
    const target = window.frames['print-dialog'];
    try {
      target.contentWindow.document.execCommand('print', false, null);
    } catch (e) {
      target.contentWindow.print();
    }
  }

  /** Strips HTML tags */
  private stripHtml(unsafe: string): string {
    return unsafe.replace(/<(?:.|\n)*?>/gm, '');
  }

  /** Escapes HTML */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Capitalizes the first letter of a string. */
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
