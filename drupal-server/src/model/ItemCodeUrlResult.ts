/** A result for a specific item code and URL. */

export interface ItemCodeUrlResult {
  code: string;
  context: string | null;
  message: string;
  selector: string;
  type: string;
  runner: string;
  typeCode: number;
}
