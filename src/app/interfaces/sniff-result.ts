import { ItemCodeUrlResult } from './item-code-url-result';

/** List of sniffs */
export interface SniffResult {
  url: string;
  // The results for a specific Item Code and URL.
  result: ItemCodeUrlResult[];
}
