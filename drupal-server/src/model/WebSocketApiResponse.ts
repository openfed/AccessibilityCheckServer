export interface WebSocketApiResponse {
  type:
    | "sniff-loading"
    | "crawled-url"
    | "crawl-url-status"
    | "sniff-result"
    | "sniff-error"
    | "ping";
  payload: any;
}
