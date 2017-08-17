import { ItemCodeUrlResultList } from './item-code-url-result-list';

/** A list of results for a specific item code. */
export interface ItemCodeResultList {
  // The results for this item code and a specific URL
  items: ItemCodeUrlResultList;
  filteredItems: ItemCodeUrlResultList;
  // The messages to show for this item code (suggested technique / success criterion)
  codeMessages: string[][];
}
