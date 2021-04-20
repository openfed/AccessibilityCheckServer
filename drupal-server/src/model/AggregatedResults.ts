import { AggregatedResult } from "./AggregatedResult";

export interface AggregatedResults {
  // The key is the aggregation hash
  [key: string]: AggregatedResult;
}
