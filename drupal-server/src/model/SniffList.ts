import { ItemCodeResultList } from "./ItemCodeResultList";

/** List of sniffs */

export interface SniffList {
  // The key is the item code (combination of suggested technique / success criteriion)
  [key: string]: ItemCodeResultList;
}
