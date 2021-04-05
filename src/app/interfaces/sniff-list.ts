import { ItemCodeResultList } from "./item-code-result-list";

/** List of sniffs */
export interface SniffList {
  // The key is the item code (combination of suggested technique / success criteriion)
  [key: string]: ItemCodeResultList;
}
