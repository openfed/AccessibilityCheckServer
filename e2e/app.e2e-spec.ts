import { BosaAccessiblityCheckServerPage } from './app.po';
import { protractor, ExpectedConditions, browser, by, element } from 'protractor';

const path = require('path');

describe('bosa-accessiblity-check-server App', () => {
  let page: BosaAccessiblityCheckServerPage;

  beforeEach(() => {
    page = new BosaAccessiblityCheckServerPage();
  });

  it('should display the page title', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Accessibility Check');
  });

  it('should list the available standards', () => {
    page.navigateTo();
    let standards = page.getStandards();
    expect(standards).toContain('Section508');
    expect(standards).toContain('WCAG2A');
    expect(standards).toContain('WCAG2AA');
    expect(standards).toContain('WCAG2AAA');
    // Attempt clicking an option.
    element(by.css('.cdk-overlay-container mat-option:first-of-type')).click();
  });

  it('should perform validation on the URL field', () => {
    page.navigateTo();
    element(by.css('app-search-form #url')).click();
    element(by.css('app-root h1')).click();
    browser.driver.sleep(500);
    expect(element.all(by.css('mat-error')).getText()).toContain('URL is required!');
    expect(element.all(by.css('mat-error')).getText()).toContain('Must be a valid URL!');
    expect(element(by.css('.check-url[disabled]')).isPresent()).toBeTruthy();

    element(by.css('app-search-form #url')).sendKeys('http:/');
    browser.driver.sleep(500);
    expect(element.all(by.css('mat-error')).getText()).not.toContain('URL is required!');
    expect(element.all(by.css('mat-error')).getText()).toContain('Must be a valid URL!');

    element(by.css('app-search-form #url')).sendKeys('/localhost:4200');
    browser.driver.sleep(500);
    expect(element.all(by.css('mat-error')).getText()).not.toContain('URL is required!');
    expect(element.all(by.css('mat-error')).getText()).not.toContain('Must be a valid URL!');

  });

  it('should toggle the advanced options when the Tools button is clicked', () => {
     page.navigateTo();
     element(by.css('app-search-form button.tools')).click();
     browser.driver.sleep(500);
     expect(element(by.css('.crawl-depth')).isPresent()).toBeTruthy();
     expect(element(by.css('.import-results')).isPresent()).toBeTruthy();
     expect(element(by.css('.export-results')).isPresent()).toBeTruthy();
     expect(element(by.css('.print-version')).isPresent()).toBeTruthy();
     // Test that these buttons are disabled by default
     expect(element(by.css('.export-results[disabled]')).isPresent()).toBeTruthy();
     expect(element(by.css('.print-version[disabled]')).isPresent()).toBeTruthy();

     element(by.css('app-search-form button.tools')).click();
     browser.driver.sleep(500);
     expect(element(by.css('.crawl-depth')).isPresent()).toBeFalsy();
     expect(element(by.css('.import-results')).isPresent()).toBeFalsy();
     expect(element(by.css('.export-results')).isPresent()).toBeFalsy();
     expect(element(by.css('.print-version')).isPresent()).toBeFalsy();
  });

  it('should abort when asked to', () => {
    page.navigateTo();
    element(by.css('app-search-form #url')).sendKeys('http://localhost:4200');
    element(by.css('.check-url')).click();
    browser.driver.sleep(200);
    element(by.css('button.abort')).click();
    // Check for the Aborted status.
    const numAbortedStatus = element.all(by.css('mat-cell')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.includes('Aborted');
      });
    }).count();
    expect(numAbortedStatus).toBe(1);

  });

  it('should run a check when asked to', () => {
    page.navigateTo();
    element(by.css('app-search-form #url')).sendKeys('http://localhost:4200');

    // Check that the pages found table is hidden.
    expect(element(by.css('.pages-found-table[hidden]')).isPresent()).toBeTruthy();

    // Check that the "Sniffing" inidicator is not there.
    expect(element(by.css('span.is-sniffing')).isPresent()).toBeFalsy();
    element(by.css('.check-url')).click();

    browser.driver.sleep(200);
    expect(element(by.css('span.is-sniffing')).isPresent()).toBeTruthy();
    // Check for the Loading status.
    const numLoadingStatus = element.all(by.css('mat-cell')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.includes('Loading');
      });
    }).count();
    expect(numLoadingStatus).toBe(1);

    // Allow the tests to run.
    const until = ExpectedConditions;
    browser.wait(until.presenceOf(element(by.css('app-sniff-list .rTable'))), 9000, 'Element taking too long to appear in the DOM');

    // Check that we have results.
    expect(element(by.css('.pages-found-table')).isPresent()).toBeTruthy();
    expect(element(by.css('.pages-found-table[hidden]')).isPresent()).toBeFalsy();
    const numUrls = element.all(by.css('mat-cell')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text === 'http://localhost:4200/';
      });
    }).count();
    expect(numUrls).toBe(1);

    const numLoadedStatus = element.all(by.css('mat-cell')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.includes('Loaded');
      });
    }).count();
    expect(numLoadedStatus).toBe(1);

    // Check that we have 0 errors, 0 warnings, 1 notice.
    const numErrors = element(by.css('.mat-card.num-errors .num'));
    const numWarnings =  element(by.css('.mat-card.num-warnings .num'));
    const numNotices =  element(by.css('.mat-card.num-notices .num'));
    expect(numErrors.getText()).toEqual('0');
    expect(numWarnings.getText()).toEqual('0');
    expect(numNotices.getText()).toEqual('1');

    // Check the notice is as expected.
    const numExpectedNotice = element.all(by.css('.rTableCell a')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.includes('Page Titled');
      });
    }).count();
    expect(numExpectedNotice).toBe(1);
  });

  // Depends on the previous test.
  it('should expand and display a listing when asked to', () => {
    expect(element(by.css('.view-details')).isPresent()).toBeFalsy();
    const toggle = element(by.css('app-sniff-list a.toggle-expand-collapse'));
    browser.executeScript("arguments[0].scrollIntoView();", toggle.getWebElement());
    toggle.click();
    browser.driver.sleep(400);
    const details = element(by.css('.view-details'));
    expect(details.isPresent()).toBeTruthy();
    toggle.click();
    browser.driver.sleep(400);
    expect(details.isPresent()).toBeFalsy();
    toggle.click();
    details.click();
    browser.driver.sleep(500);
    expect(element(by.css('sniff-url-dialog .result')).isPresent()).toBeTruthy();
    browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
    browser.driver.sleep(500);
  });

  // Depends on the previous test
  it('should filter the notices when asked to', () => {
    expect(element.all(by.css('.rTableCell a')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.includes('Page Titled');
      });
    }).count()).toBe(1);
    const toggle = element(by.css('.num-notices mat-slide-toggle .mat-slide-toggle-bar'));
    browser.executeScript("arguments[0].scrollIntoView();", toggle.getWebElement());
    toggle.click();
    browser.driver.sleep(500);
    expect(element.all(by.css('.rTableCell a')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.includes('Page Titled');
      });
    }).count()).toBe(0);
    toggle.click();
    browser.driver.sleep(500);
    expect(element.all(by.css('.rTableCell a')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.includes('Page Titled');
      });
    }).count()).toBe(1);
  });

  it('should be able to export and import results', () => {
    page.navigateTo();
    element(by.css('app-search-form #url')).sendKeys('http://localhost:4200');
    element(by.css('.check-url')).click();
    const until = ExpectedConditions;
    browser.wait(until.presenceOf(element(by.css('app-sniff-list .rTable'))), 9000, 'Element taking too long to appear in the DOM');
    element(by.css('app-search-form button.tools')).click();
    browser.driver.sleep(500);
    element(by.css('.export-results')).click();
    browser.driver.sleep(500);

    // Reload.
    page.navigateTo();

    // Import results.
    element(by.css('app-search-form button.tools')).click();
    browser.driver.sleep(500);
    const absolutePath = path.resolve(process.cwd(), './e2e/downloads/export.json');
    element(by.css('input[type="file"]')).sendKeys(absolutePath);
    browser.driver.sleep(500);

    // Check that we have 0 errors, 0 warnings, 1 notice.
    const numErrors = element(by.css('.mat-card.num-errors .num'));
    const numWarnings =  element(by.css('.mat-card.num-warnings .num'));
    const numNotices =  element(by.css('.mat-card.num-notices .num'));
    expect(numErrors.getText()).toEqual('0');
    expect(numWarnings.getText()).toEqual('0');
    expect(numNotices.getText()).toEqual('1');

    // Check the notice is as expected
    const numExpectedNotice = element.all(by.css('.rTableCell a')).filter(function(elem, index) {
      return elem.getText().then(function(text) {
        return text.includes('Page Titled');
      });
    }).count();
    expect(numExpectedNotice).toBe(1);
  });

  // Depends on previous test.
  it('should show a printable version of the results', () => {
    element(by.css('.print-version')).click();
    browser.driver.sleep(500);
    expect(element(by.css('print-dialog h2')).getText()).toEqual('Print version');
    expect(element(by.css('print-dialog .print-version-print')).isPresent()).toBeTruthy();
    expect(element(by.css('print-dialog iframe')).getAttribute('srcdoc')).toContain('<h1>Accessibility check results</h1>');
  });

});
