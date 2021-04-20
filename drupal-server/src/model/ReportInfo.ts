import { ScanStatusInfo } from "./ScanStatusInfo";

export interface ReportInfo {
  status: ScanStatusInfo;
  numTotalErrors: {
    [code: string]: number;
  };
  numUrlsWithErrors: {
    [code: string]: number;
  };
}
