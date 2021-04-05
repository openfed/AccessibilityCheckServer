import { Body, Controller, Example, Get, Post, Response, Route, SuccessResponse } from "tsoa";
import { config } from "../config";
import { TooManyRequestsError } from "../model/too-many-requests-error";
import { v4 as uuidv4 } from 'uuid';
import ws from 'ws';

interface WebSocketApiResponse {
  type: 'sniff-loading' | 'crawled-url' | 'crawl-url-status' | 'sniff-result' | 'ping',
  payload: any;
}

/** 
 * @example {
 *    "urls": ["https://politie.be", "https://police.be"],
 *    "settings": {
 *      "depth": 0,
 *      "standard": "WCAG2AA"
 *    }
 *  }
 */
interface RunScanRequest {
  urls: string[];
  settings: {
    depth: number;
    standard: string;
  }
}

interface RunScanResponse {
  scanToken: string;
}

/** 
 * @example {
 *    "error": "something bad happened"
 *  }
 */
interface ErrorResponse {
  error: string;
}

type ScanStatus = 'Received' | 'Running' | 'Completed' | 'Failed';

interface ScanStatusInfo {
    status: ScanStatus,
    numPagesScanned: number,
    numErrorsFound: number,
};

@Route("")
export default class ScanController extends Controller {
  private numberOfScansRunning = 0;

  private scanStatus: { [token: string]: ScanStatusInfo } = {};

  @Example<RunScanResponse>({
    scanToken: '[UUID]',
  })
  @Response<ErrorResponse>(422, "Validation Failed")
  @SuccessResponse("201", "Created") // Custom success response
  @Post("/scan")
  public async runScan(@Body() request: RunScanRequest): Promise<RunScanResponse> {
    if (this.numberOfScansRunning >= config.maxSimultaneousScans) {
      throw new TooManyRequestsError();
    }
    const scanToken = uuidv4();
    this.scanStatus[scanToken] = {
      status: 'Received',
      numPagesScanned: 0,
      numErrorsFound: 0,
    };
    const client = new ws(config.wsServerUrl);
    client.on('open', () => {
      this.numberOfScansRunning++;
      const query = {
        type: 'crawl-url',
        payload: {
          "url": "https://www.nytimes.com/2001/12/16/books/chapters/heideggers-children.html",
          "standard": "WCAG2AA",
          "crawlDepth": "0",
          "language": "en-US"
        },
      };
      client.send(JSON.stringify(query));
    });
    client.on('close', () => {
      this.numberOfScansRunning--;
      console.log('closed');
      if (this.scanStatus[scanToken].status !== 'Completed') {
        this.scanStatus[scanToken].status = 'Failed';
      }
    });
    client.on('message', (ev: any) => {
      let event: WebSocketApiResponse;
      try {
        event = JSON.parse(ev);
      } catch (e) {
        event = ev;
      }
      console.log(event, event.type);
      if (event.type === 'ping') {
        client.send(JSON.stringify({
          type: 'pong',
          payload: {},
        }));
      }
      if (event.type === 'crawled-url') {
        this.scanStatus[scanToken].numPagesScanned++;
      }
      if (event.type === 'crawl-url-status') {
        const payload = event.payload as { status: 'complete' | 'started' | 'aborted'};
        if (payload.status === 'complete') {
          this.scanStatus[scanToken].status = 'Completed';
        }
        if (payload.status === 'started') {
          this.scanStatus[scanToken].status = 'Running';
        }
      }
      if (event.type === 'sniff-result') {
        const payload = event.payload as { url: string, result: {
          code: string,
          context: string,
          message: string,
          selector: string,
          type: string,
          typeCode: number,
        }[]};
        const numErrors = payload.result.filter(x => x.type === 'error').length;
        this.scanStatus[scanToken].numErrorsFound += numErrors;
      }
    })
    this.setStatus(201);
    return {
      scanToken,
    };
  }

  @Response<void>(404, "Not found")
  @Get("/scan/{token}/status")
  public async getScanStatus(token: string): Promise<ScanStatusInfo | void> {
    const status = this.scanStatus[token];
    if (!status) {
        this.setStatus(404);
        return;
    }
    return status;
  }


  @Example<{example: string}>({"example": "json"})
  @Get("/scan/{token}/report")
  public async getJsonResult(token: string): Promise<string> {
    console.log(token);
    return JSON.stringify({
      message: "test"
    });
  }

  @Example<{example: string}>({"example": "json"})
  @Get("/scan/{token}/angular-app-export")
  public async getAngularAppJsonResult(token: string): Promise<string> {
    console.log(token);
    return JSON.stringify({
      message: "test"
    });
  } 
}
