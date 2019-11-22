import { Injectable } from '@angular/core';
import { SniffList } from '../interfaces/sniff-list';
import { ItemCodeUrlResult } from '../interfaces/item-code-url-result';
import { ApiService } from './api.service';
import { AudienceType } from '../audience';
import * as cloneDeep from 'lodash/cloneDeep';
import { isCmOnlySniff, isDevOnlySniff } from '../audience.functions';

/** Provides an observable to subscribe to which sends out a message whenever we want to reinitialize. */
@Injectable()
export class SniffListService {
  /** This object may also be mutated in other components using it (such as the SniffListComponent). */
  private sniffList: SniffList;

  constructor(private apiService: ApiService) {
    this.init();
  }

  init(): void {
    this.sniffList = {};
  }

  setSniffList(sniffList: SniffList): void {
    this.sniffList = sniffList;
  }

  getSniffList(): SniffList {
    return this.sniffList;
  }

  getAudienceFilteredSniffList(audienceType: AudienceType): SniffList {
    if (audienceType === AudienceType.All) {
      return this.sniffList;
    } else if (audienceType === AudienceType.Developers) {
      const cloned = cloneDeep(this.sniffList);
      // filter out all content-manager only sniffs
      Object.keys(cloned)
        .filter(key => isCmOnlySniff(key))
        .forEach(x => {
          delete cloned[x];
        });
      return cloned;
    } else if (audienceType === AudienceType.ContentManagers) {
      const cloned = cloneDeep(this.sniffList);
      // filter out all developer only sniffs
      Object.keys(cloned)
        .filter(key => isDevOnlySniff(key))
        .forEach(x => {
          delete cloned[x];
        });
      return cloned;
    }
  }

  /**
   * Adds an item to the sniff list.
   * @param item {ItemCodeUrlResult} item to add.
   */
  addItem(item: ItemCodeUrlResult, url: string): void {
    if (this.sniffList[item.code] === undefined) {
      // Initialize the array that will hold the results.
      this.sniffList[item.code] = {
        items: {},
        // Items, with errors/warnings/notices filtered out if needd.
        filteredItems: {},
        // The messages to show for this specific item code.
        codeMessages: this.apiService.getMessageInfo(item.code)
      };
    }

    // Initialize the array that will hold the sniff results.
    if (this.sniffList[item.code].items[url] === undefined) {
      this.sniffList[item.code].items[url] = <ItemCodeUrlResult[]>[];
    }

    // Add the is item to the sniff list, keyed by code and URL.
    this.sniffList[item.code].items[url].push(item);
  }

  /**
   * Filter the results for a specific code, removing notices/warnings/errors if the toggle is set to disabled.
   * @param code {string} code to filter the results for (example: WCAG2AA.Principle1.Guideline1_3.1_3_4.)
   * @param showNotices {boolean}
   * @param showWarnings {boolean}
   * @param showErrors {boolean}
   */
  filterResults(code: string, showNotices: boolean, showWarnings: boolean, showErrors: boolean): void {
    let urls = Object.keys(this.sniffList[code].items);

    urls.forEach(url => {
      if (this.sniffList[code].filteredItems[url] === undefined) {
        this.sniffList[code].filteredItems[url] = <ItemCodeUrlResult[]>[];
      }
      this.sniffList[code].filteredItems[url] = this.sniffList[code].items[url].filter(item => {
        return (
          (item.type === 'notice' && showNotices) ||
          (item.type === 'warning' && showWarnings) ||
          (item.type === 'error' && showErrors)
        );
      });
      // Clean up the URL if there are no results for it.
      if (this.sniffList[code].filteredItems[url].length === 0) {
        delete this.sniffList[code].filteredItems[url];
      }
    });
  }
}
