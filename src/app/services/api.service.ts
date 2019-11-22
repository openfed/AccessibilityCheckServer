import { Injectable, NgZone } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { SniffResult } from '../interfaces/sniff-result';
import { SniffLoading } from '../interfaces/sniff-loading';
import { SniffError } from '../interfaces/sniff-error';
import { CrawlUrlStatus } from '../interfaces/crawl-url-status';

import 'rxjs/add/operator/filter';
import config from '../config';

import * as io from 'socket.io-client';

/**
 * Service used for communicating with the backend server.
 * Note: we run socket.io subscriptions outside Angular because of
 * https://christianliebel.com/2016/11/angular-2-protractor-timeout-heres-fix/
 */
@Injectable()
export class ApiService {
  // The URL to connect to.
  private url: string = config.apiServerUrl;
  private socket: io.Socket;

  constructor(private http: HttpClient, private ngZone: NgZone) {
    // Initialize the socket.
    this.ngZone.runOutsideAngular(() => {
      this.socket = io(this.url);
    });
  }

  /**
   * Send out an URL to start crawling at.
   * @param {string} url - The URL to crawl.
   * @param {string} standard - The accessibility standard to use.
   * @param {string} crawlDepth - How deep to crawl.
   */
  sendUrl(url: string, standard: string, crawlDepth: string): void {
    this.socket.emit('crawl-url', {
      url: url,
      standard: standard,
      crawlDepth: crawlDepth
    });
  }

  /**  Observable that emits URLs that have been crawled. */
  getCrawledUrls(): Observable<string> {
    return this.createObservableFromSocketIoEvent('crawled-url');
  }

  /**
   * Observable that emits the results for a specific URL.
   * @param {string} url - The URL to filter results on.
   */
  getSniffResults(url: string): Observable<SniffResult> {
    // Only get results for this specific URL.
    return this.getAllSniffResults().filter((result: SniffResult) => url === result.url);
  }

  /**
   * Retrieves the message info for a specific code.
   * @param {string} code - The code to get message info for.
   */
  getMessageInfo(code: string): any {
    const standard = code.split('.')[0];
    // Used for translating message codes to actual messages.
    // Connects to an external HTMLCS.js javascript file.
    return (<any>window)['HTMLCS_' + standard].getMsgInfo(code);
  }

  /** Observable that emits all sniff results. */
  getAllSniffResults(): Observable<SniffResult> {
    return this.createObservableFromSocketIoEvent('sniff-result');
  }

  /**
   * Observable that emits the loading status for a specific URL.
   * @param {string} url - The URL to filter results on.
   */
  getSniffLoading(url: string): Observable<SniffLoading> {
    return this.createObservableFromSocketIoEvent('sniff-loading').filter((result: SniffLoading) => url === result.url);
  }

  /**
   * Observable that emits the error status for a specific URL.
   * @param {string} url - The URL to filter results on.
   */
  getSniffError(url: string): Observable<SniffError> {
    return this.createObservableFromSocketIoEvent('sniff-error').filter((result: SniffError) => url === result.url);
  }

  /** Observable that emits where we are in the crawl (started/aborted/complete) */
  crawlStatus(): Observable<CrawlUrlStatus> {
    return this.createObservableFromSocketIoEvent('crawl-url-status');
  }

  /** Retrieves a list of standards. */
  getStandards(): Observable<any> {
    return this.http.get(this.url + '/standards');
  }

  /** Aborts everything on the backend server for the current socket. */
  abortAll(): void {
    this.socket.emit('abort');
  }

  /**
   * Creates an Observable based on a Socket.IO Event.
   * @param {string} eventName - Name of the Socket.IO event.
   */
  private createObservableFromSocketIoEvent(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, data => {
        observer.next(data);
      });
    });
  }
}
