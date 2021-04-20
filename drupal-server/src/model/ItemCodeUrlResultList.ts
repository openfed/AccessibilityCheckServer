import { ItemCodeUrlResult } from "./ItemCodeUrlResult";

/** A list of results for a specific item code and a specific URL. */

export interface ItemCodeUrlResultList {
  // the key is the URL
  [key: string]: ItemCodeUrlResult[];
}
