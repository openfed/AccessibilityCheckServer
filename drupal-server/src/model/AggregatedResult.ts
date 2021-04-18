import { ItemCodeUrlResult } from "./ItemCodeUrlResult";

export interface AggregatedResult {
  numResults: number;
  result: ItemCodeUrlResult;
  averageOccurrencesPerPage?: number;
}
