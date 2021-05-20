import { ScanStatus } from "./ScanStatus";

export interface ScanStatusInfo {
  url: string;
  finished?: Date;
  started: Date;
  status: ScanStatus;
  numPagesScanned: number;
  numPagesCrawled: number;
  numErrorsFound: number;
  urlScanErrors: {
    [url: string]: string;
  };
  webSocketError?: string;
}
