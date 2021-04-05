import { Injectable } from "@angular/core";
import { SniffList } from "../interfaces/sniff-list";
import { ItemCodeUrlResult } from "../interfaces/item-code-url-result";
import { ApiService } from "./api.service";
import { AudienceType } from "../audience";
import { cloneDeep } from "lodash";
import { isCmOnlySniff, isDevOnlySniff } from "../audience.functions";
import { AggregationAggressiveness } from "../model/aggregation-aggressiveness";
import * as md5 from "md5";

/** Provides an observable to subscribe to which sends out a message whenever we want to reinitialize. */
@Injectable({
  providedIn: "root"
})
export class SniffListService {
  /** This object may also be mutated in other components using it (such as the SniffListComponent). */
  private sniffList: SniffList;

  constructor(private apiService: ApiService) {
    this.init();
  }

  public init(): void {
    this.sniffList = {};
  }

  public setSniffList(sniffList: SniffList): void {
    this.sniffList = { ...sniffList };
  }

  public getSniffList(): SniffList {
    return this.sniffList;
  }

  public getFilteredSniffList(
    audienceType: AudienceType,
    aggressiveness: AggregationAggressiveness
  ): SniffList {
    const sniffList = this.createAudienceFilteredSniffList(
      audienceType,
      this.sniffList
    );
    return this.createAggregatedSniffList(aggressiveness, sniffList);
  }

  /**
   * Adds an item to the sniff list.
   * @param item {ItemCodeUrlResult} item to add.
   */
  public addItem(item: ItemCodeUrlResult, url: string): void {
    if (this.sniffList[item.code] === undefined) {
      // Initialize the array that will hold the results.
      this.sniffList[item.code] = {
        items: {},
        // Items, with errors/warnings/notices filtered out if needed.
        filteredItems: {},
        // Items with any currently active aggregations applied to it.
        aggregatedFilteredItems: {},
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

    this.sniffList = { ...this.sniffList };
  }

  /**
   * Filter the results for a specific code, removing notices/warnings/errors if the toggle is set to disabled.
   *
   * @param code {string} code to filter the results for (example: WCAG2AA.Principle1.Guideline1_3.1_3_4.)
   * @param showNotices {boolean}
   * @param showWarnings {boolean}
   * @param showErrors {boolean}
   */
  public filterResults(
    code: string,
    showNotices: boolean,
    showWarnings: boolean,
    showErrors: boolean
  ): void {
    let urls = Object.keys(this.sniffList[code].items);

    urls.forEach(url => {
      if (this.sniffList[code].filteredItems[url] === undefined) {
        this.sniffList[code].filteredItems[url] = <ItemCodeUrlResult[]>[];
      }
      this.sniffList[code].filteredItems[url] = this.sniffList[code].items[
        url
      ].filter(item => {
        return (
          (item.type === "notice" && showNotices) ||
          (item.type === "warning" && showWarnings) ||
          (item.type === "error" && showErrors)
        );
      });
      // Clean up the URL if there are no results for it.
      if (this.sniffList[code].filteredItems[url].length === 0) {
        delete this.sniffList[code].filteredItems[url];
      }
    });
  }

  private createAudienceFilteredSniffList(
    audienceType: AudienceType,
    sniffList: SniffList
  ) {
    const cloned = cloneDeep(sniffList);
    if (audienceType === AudienceType.All) {
      return cloned;
    } else if (audienceType === AudienceType.Developers) {
      // filter out all content-manager only sniffs
      Object.keys(cloned)
        .filter(key => isCmOnlySniff(key))
        .forEach(x => {
          delete cloned[x];
        });
      return cloned;
    } else if (audienceType === AudienceType.ContentManagers) {
      // filter out all developer only sniffs
      Object.keys(cloned)
        .filter(key => isDevOnlySniff(key))
        .forEach(x => {
          delete cloned[x];
        });
      return cloned;
    }
  }

  private createAggregatedSniffList(
    aggressiveness: AggregationAggressiveness,
    sniffList: SniffList
  ) {
    // Mutates the sniff list and sets the aggregated values based on a hash function. Modifies the selector within the aggregation according to a given setter.
    function setAggregated(
      hashFn: (ItemCodeUrlResult) => string,
      selectorSetter: (string) => string,
      setAverage: boolean
    ) {
      Object.keys(sniffList).forEach(key => {
        // Counts of how many times this sniff occurs in a page (when it does occur).
        const totalOccurrenceCount: { [hash: string]: number[] } = {};

        Object.values(sniffList[key].filteredItems).forEach(resultsForUrl => {
          const occurrenceCountInThisUrl: { [hash: string]: number } = {};
          resultsForUrl.forEach(result => {
            const updatedResult = {
              ...result,
              selector: selectorSetter(result.selector)
            };
            const hash = hashFn(updatedResult);
            if (!occurrenceCountInThisUrl[hash]) {
              occurrenceCountInThisUrl[hash] = 0;
            }
            occurrenceCountInThisUrl[hash]++;

            if (!sniffList[key].aggregatedFilteredItems[hash]) {
              sniffList[key].aggregatedFilteredItems[hash] = {
                result: updatedResult,
                numResults: 1
              };
              sniffList[key].aggregatedFilteredItems[hash].numResults = 1;
            } else {
              sniffList[key].aggregatedFilteredItems[hash].numResults++;
            }
          });

          Object.keys(occurrenceCountInThisUrl).forEach(hash => {
            if (!totalOccurrenceCount[hash]) {
              totalOccurrenceCount[hash] = [];
            }
            totalOccurrenceCount[hash].push(occurrenceCountInThisUrl[hash]);
          });
        });

        if (setAverage) {
          Object.keys(totalOccurrenceCount).forEach(hash => {
            sniffList[key].aggregatedFilteredItems[
              hash
            ].averageOccurrencesPerPage =
              totalOccurrenceCount[hash].reduce((prev, curr) => prev + curr) /
              totalOccurrenceCount[hash].length;
          });
        }
      });
    }

    Object.keys(sniffList).forEach(key => {
      sniffList[key].aggregatedFilteredItems = {};
    });

    if (aggressiveness === AggregationAggressiveness.Minimal) {
      // Do nothing
    } else if (aggressiveness === AggregationAggressiveness.Limited) {
      setAggregated(
        x => md5(`${x.selector}${x.context}`),
        x => x,
        false
      );
    } else if (aggressiveness === AggregationAggressiveness.VariableContent) {
      setAggregated(
        x => md5(`${x.selector}`),
        x => x,
        true
      );
    } else if (aggressiveness === AggregationAggressiveness.RepeatedError1) {
      setAggregated(
        x => md5(`${x.selector}`),
        x => {
          const parts = x.split(" > ");
          if (parts.length < 2) {
            return x;
          }
          parts.pop();
          parts.push("*");
          return parts.join(" > ");
        },
        true
      );
    } else if (aggressiveness === AggregationAggressiveness.RepeatedError2) {
      setAggregated(
        x => md5(`${x.selector}`),
        x => {
          const parts = x.split(" > ");
          if (parts.length < 3) {
            return x;
          }
          parts.pop();
          parts.pop();
          parts.push("*");
          parts.push("*");
          return parts.join(" > ");
        },
        true
      );
    }
    return sniffList;
  }
}
