import { ItemCodeUrlResultList } from "./ItemCodeUrlResultList";
import { AggregatedResults } from "./AggregatedResults";

/** A list of results for a specific item code. */

export interface ItemCodeResultList {
  // The results for this item code and a specific URL
  items: ItemCodeUrlResultList;
  // The results, with any notices/warnings/errors filtered out
  filteredItems: ItemCodeUrlResultList;
  aggregatedFilteredItems: AggregatedResults;
  // The messages to show for this item code (suggested technique / success criterion)
  codeMessages: string[][];
}
