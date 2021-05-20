/**
 * @example {
 *    "urls": ["https://politie.be", "https://police.be"],
 *    "settings": {
 *      "depth": 0,
 *      "standard": "WCAG2AA"
 *    }
 *  }
 */
export interface RunScanRequest {
  urls: string[];
  settings: {
    depth: number;
    standard: string;
  };
}
