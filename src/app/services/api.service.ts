import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from "@angular/common/http";
import { SniffResult } from '../interfaces/sniff-result';
import { SniffLoading } from '../interfaces/sniff-loading';
import { SniffError } from '../interfaces/sniff-error';
import { CrawlUrlStatus } from '../interfaces/crawl-url-status';

import 'rxjs/add/operator/filter';
import config from '../config';

import * as io from 'socket.io-client';

@Injectable()
export class ApiService {

  // The URL to connect to.
  private url : string = config.apiServerUrl;
  private socket : io.Socket;

  constructor(private http: HttpClient) {
    // Initialize the socket.
    this.socket = io(this.url);
  }

  /**
   * Send out an URL to start crawling at.
   * @param {string} url - The URL to crawl.
   * @param {string} standard - The accessibility standard to use.
   * @param {string} crawlDepth - How deep to crawl.
   */
  sendUrl(url, standard, crawlDepth) : void {
    this.socket.emit('crawl-url', {
      url: url,
      standard: standard,
      crawlDepth: crawlDepth
    });
  }

  /**  Observable that emits URLs that have been crawled. */
  getCrawledUrls() : Observable<string> {
    let observable = new Observable(observer => {
      this.socket.on('crawled-url', (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

  /**
   * Observable that emits the results for a specific URL.
   * @param {string} url - The URL to filter results on.
   */
  getSniffResults(url): Observable<SniffResult> {
    return new Observable(observer => {
      this.socket.on('sniff-result', (data) => {
        // data is a SniffResult object.
        observer.next(data);
      });
    })
    // Only get results for this specific URL.
    .filter((result: SniffResult) => url == result.url);
  }

  /**
   * Retrieves the message info for a specific code.
   * @param {string} code - The code to get message info for.
  */
  getMessageInfo(code) : any {
    const standard = code.split(".")[0];
    // Used for translating message codes to actual messages.
    // Connects to an external HTMLCS.js javascript file.
    return (<any>window)['HTMLCS_' + standard].getMsgInfo(code);
  }

  /** Observable that emits all sniff results. */
  getAllSniffResults() : Observable<SniffResult>  {
    return new Observable(observer => {
      this.socket.on('sniff-result', (data) => {
        observer.next(data);
      });
    });
  }

  /**
   * Observable that emits the loading status for a specific URL.
   * @param {string} url - The URL to filter results on.
   */
  getSniffLoading(url) : Observable<SniffLoading> {
    return new Observable(observer => {
      this.socket.on('sniff-loading', (data) => {
        observer.next(data);
      });
    }).filter((result: SniffLoading) => url == result.url);
  }

  /**
   * Observable that emits the error status for a specific URL.
   * @param {string} url - The URL to filter results on.
   */
  getSniffError(url) : Observable<SniffError> {
     return new Observable(observer => {
      this.socket.on('sniff-error', (data) => {
        observer.next(data);
      });
    }).filter((result: SniffError) => url == result.url);
  }

  /** Observable that emits where we are in the crawl (started/aborted/complete) */
  crawlStatus() :  Observable<CrawlUrlStatus> {
    return new Observable(observer => {
      this.socket.on('crawl-url-status', (data) => {
        observer.next(data);
      });
    });
  }

  /** Retrieves a list of standards. */
  getStandards() : Observable<string[]> {
    return this.http.get(this.url + '/standards');
  }

  /** Aborts everything on the backend server for the current socket. */
  abortAll() : void {
    this.socket.emit('abort');
  }
}
