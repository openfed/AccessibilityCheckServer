import {
  Body,
  Controller,
  Example,
  Get,
  Post,
  Response,
  Route,
  SuccessResponse
} from "tsoa";
import { config } from "../config";
import { v4 as uuidv4 } from "uuid";
import ws from "ws";

// Needed for HTMLCS
import jsdom from "jsdom";
import {
  AngularAppExport,
  WebSocketApiResponse,
  SniffResultPayload,
  SniffList,
  ItemCodeUrlResult,
  RunScanResponse,
  ErrorResponse,
  ScanStatusInfo,
  ReportInfo,
  RunScanRequest,
  TooManyRequestsError
} from "../model";
const { JSDOM } = jsdom;
global.document = new JSDOM("<html></html>").window.document;
// tslint:disable-next-line:no-require-imports
const HTMLCS = require("../../../src/assets/HTMLCS.js");

@Route("")
export default class ScanController extends Controller {
  private numberOfScansRunning = 0;

  private scanStatus: { [token: string]: ScanStatusInfo } = {};
  private sniffLists: { [token: string]: SniffList } = {};

  @Example<RunScanResponse>({
    scanTokens: {
      "https://exemple.be": "a8934c08-fbd6-418a-8bcd-0728dd9326ed",
      "https://voorbeeld.be": "e77c947a-7bd6-48e2-860f-f7bc870499b9"
    }
  })
  @Response<ErrorResponse>(429, "Too many requests")
  @SuccessResponse("201", "Created")
  @Post("/scan")
  public async runScan(
    @Body() request: RunScanRequest
  ): Promise<RunScanResponse> {
    const numRequested = request.urls.length;
    if (
      this.numberOfScansRunning + numRequested >
      config.maxSimultaneousScans
    ) {
      throw new TooManyRequestsError(
        `${
          this.numberOfScansRunning
        } scans running + ${numRequested} additional scans requested exceeds the configured maximum of ${
          config.maxSimultaneousScans
        } simultaneous scans.`
      );
    }

    if (request.settings.standard === "Section508") {
      throw new Error("Section508 standard not supported");
    }

    const result: RunScanResponse = { scanTokens: {} };
    request.urls.forEach(url => {
      const scanToken = uuidv4();
      console.log(`[${scanToken}] Created token for URL: ${url}`);
      result.scanTokens[url] = scanToken;
      this.scanStatus[scanToken] = {
        url,
        started: new Date(),
        status: "Received",
        numPagesCrawled: 0,
        numPagesScanned: 0,
        numErrorsFound: 0,
        urlScanErrors: {}
      };
      this.startScan(
        scanToken,
        url,
        request.settings.depth,
        request.settings.standard
      );
    });
    this.setStatus(201);
    return result;
  }

  @Example<ScanStatusInfo>({
    url: "https://www.example.com/page.html",
    finished: new Date("2021-04-11T22:19:31.133Z"),
    started: new Date("2021-04-11T22:18:33.833Z"),
    status: "Completed",
    numPagesCrawled: 1,
    numPagesScanned: 1,
    numErrorsFound: 13,
    urlScanErrors: {
      "https://www.example.com/error-page.html": "Could not start Chrome"
    }
  })
  @Response<void>(404, "Not found")
  @Get("/scan/{token}/status")
  public async getScanStatus(token: string): Promise<ScanStatusInfo | void> {
    const status = this.scanStatus[token];
    if (!status) {
      this.setStatus(404);
      return;
    }
    this.setStatus(200);
    return status;
  }

  @Example<ReportInfo>({
    status: {
      url: "https://www.example.com/page.html",
      started: new Date("2021-04-11T22:18:33.833Z"),
      status: "Completed",
      numPagesCrawled: 1,
      numPagesScanned: 1,
      numErrorsFound: 13,
      urlScanErrors: {}
    },
    numTotalErrors: {
      "WCAG2AA.Principle2.Guideline2_4.2_4_1.H64.1": 7,
      "WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoContent": 1,
      "WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail": 5
    },
    numUrlsWithErrors: {
      "WCAG2AA.Principle2.Guideline2_4.2_4_1.H64.1": 1,
      "WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoContent": 1,
      "WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail": 1
    }
  })
  @Get("/scan/{token}/report")
  public async getJsonResult(token: string): Promise<ReportInfo | void> {
    if (
      !this.sniffLists[token] ||
      !this.scanStatus[token] ||
      this.scanStatus[token].status !== "Completed"
    ) {
      this.setStatus(404);
      return;
    }
    const sniffList = this.sniffLists[token];
    const numTotalErrors: { [principle: string]: number } = {};
    const numUrlsWithErrors: { [principle: string]: number } = {};
    Object.keys(sniffList).forEach(principle => {
      Object.values(sniffList[principle].items).forEach(itemList => {
        // itemList will contain all sniff results for a given url/principle combination.
        const errorItems = itemList.filter(item => item.type === "error");
        if (errorItems.length > 0) {
          if (!numTotalErrors[principle]) {
            numTotalErrors[principle] = 0;
          }
          if (!numUrlsWithErrors[principle]) {
            numUrlsWithErrors[principle] = 0;
          }
          numTotalErrors[principle] += errorItems.length;
          numUrlsWithErrors[principle]++;
        }
      });
    });
    this.setStatus(200);
    return {
      status: this.scanStatus[token],
      numTotalErrors,
      numUrlsWithErrors
    };
  }

  @Response<void>(404, "Not found")
  @Example<AngularAppExport>({
    sniffList: {
      "WCAG2AA.Principle2.Guideline2_4.2_4_3.H4.2": {
        items: {
          "https://www.example.com/page.html": [
            {
              code: "WCAG2AA.Principle2.Guideline2_4.2_4_3.H4.2",
              type: "notice",
              typeCode: 3,
              message:
                "If tabindex is used, check that the tab order specified by the tabindex attributes follows relationships in the content.",
              context: null,
              selector: "",
              runner: "htmlcs"
            }
          ]
        },
        filteredItems: {},
        aggregatedFilteredItems: {},
        codeMessages: [
          [
            "Success Criterion",
            '<a href="http://www.w3.org/TR/WCAG21/#focus-order" target="_blank">2.4.3: Focus Order</a>'
          ],
          [
            "Suggested Techniques",
            '<a href="https://www.w3.org/WAI/WCAG21/Techniques/html/H4" target="_blank">H4</a>'
          ]
        ]
      }
    },
    version: "1.0"
  })
  @Get("/scan/{token}/angular-app-export")
  public async getAngularAppJsonResult(
    token: string
  ): Promise<AngularAppExport | void> {
    if (
      !this.sniffLists[token] ||
      !this.scanStatus[token] ||
      this.scanStatus[token].status !== "Completed"
    ) {
      this.setStatus(404);
      return;
    }

    this.setStatus(200);
    return {
      version: "1.0",
      sniffList: this.sniffLists[token]
    };
  }

  private startScan(
    scanToken: string,
    url: string,
    depth: number,
    standard: string
  ): void {
    const client = new ws(config.wsServerUrl);

    client.on("open", () => {
      this.numberOfScansRunning++;
      console.log(`[${scanToken}] Starting scan`);
      const query = {
        type: "crawl-url",
        payload: {
          url: url,
          standard: standard,
          crawlDepth: depth.toString(),
          language: "en-US"
        }
      };
      this.sniffLists[scanToken] = {};
      client.send(JSON.stringify(query));
    });

    client.on("close", () => {
      this.numberOfScansRunning--;
      this.scanStatus[scanToken].finished = new Date();
      // Clean up after configured lifetime (default: 4 hours)
      setTimeout(() => {
        delete this.scanStatus[scanToken];
        delete this.sniffLists[scanToken];
      }, config.sniffResultLifetimeMs);
      console.log(`[${scanToken}] Closed scan`);
      if (this.scanStatus[scanToken].status !== "Completed") {
        this.scanStatus[scanToken].status = "Failed";
      }
      console.log(
        `[${scanToken}] Status: ${JSON.stringify(this.scanStatus[scanToken])}`
      );
    });

    client.on("error", (ev: Event) => {
      console.error(`[${scanToken}] WebSocket error: `, ev);
      this.scanStatus[scanToken].webSocketError = ev.toString();
      client.close();
    });

    client.on("message", (ev: any) => {
      let event: WebSocketApiResponse;
      try {
        event = JSON.parse(ev);
      } catch (e) {
        event = ev;
      }
      if (event.type === "ping") {
        client.send(
          JSON.stringify({
            type: "pong",
            payload: {}
          })
        );
      }
      switch (event.type) {
        case "crawled-url": {
          this.scanStatus[scanToken].numPagesCrawled++;
          break;
        }
        case "crawl-url-status": {
          const payload = event.payload as {
            status: "complete" | "started" | "aborted";
          };
          if (payload.status === "complete") {
            // Mark as failed if we crawled 0 pages (i.e. because of robots.txt)
            this.scanStatus[scanToken].status = this.scanStatus[scanToken].numPagesCrawled === 0 || this.scanStatus[scanToken].numPagesScanned === 0 ? "Failed" : "Completed";
            client.close();
          }
          if (payload.status === "started") {
            this.scanStatus[scanToken].status = "Running";
          }
          break;
        }
        case "sniff-result": {
          this.scanStatus[scanToken].numPagesScanned++;
          const payload = event.payload as SniffResultPayload;
          const numErrors = payload.result.filter(x => x.type === "error")
            .length;
          this.scanStatus[scanToken].numErrorsFound += numErrors;
          payload.result.forEach(result => {
            this.addItem(scanToken, result, payload.url);
          });
          break;
        }
        case "sniff-error": {
          const payload = event.payload as {
            url: string;
            error: string;
          };
          console.error(
            `[${scanToken}] sniff error for ${payload.url}: ${payload.error}`
          );
          this.scanStatus[scanToken].urlScanErrors[payload.url] = payload.error;
          break;
        }
        default:
          break;
      }
    });
  }

  /**
   * Adds an item to the sniff list.
   * @param item {ItemCodeUrlResult} item to add.
   */
  private addItem(token: string, item: ItemCodeUrlResult, url: string): void {
    if (this.sniffLists[token][item.code] === undefined) {
      // Initialize the array that will hold the results.
      this.sniffLists[token][item.code] = {
        items: {},
        // Items, with errors/warnings/notices filtered out if needed.
        filteredItems: {},
        // Items with any currently active aggregations applied to it.
        aggregatedFilteredItems: {},
        // The messages to show for this specific item code.
        codeMessages: this.getMessageInfo(item.code)
      };
    }

    // Initialize the array that will hold the sniff results.
    if (this.sniffLists[token][item.code].items[url] === undefined) {
      this.sniffLists[token][item.code].items[url] = <ItemCodeUrlResult[]>[];
    }

    // Add the is item to the sniff list, keyed by code and URL.
    this.sniffLists[token][item.code].items[url].push(item);
  }

  /**
   * Retrieves the message info for a specific code.
   * @param {string} code - The code to get message info for.
   */
  private getMessageInfo(code: string): any {
    const standard = code.split(".")[0];
    // Used for translating message codes to actual messages.
    // Connects to an external HTMLCS.js javascript file.
    return HTMLCS.HTMLCS_WCAG2AAA.getMsgInfo(code);
  }
}
