import { browser, by, element } from 'protractor';

export class BosaAccessiblityCheckServerPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getStandards() {
    const select = element(by.css('app-search-form mat-select'));
    select.click();
    // Wait for the renderings
    browser.driver.sleep(1000);
    return element.all(by.css('.cdk-overlay-container mat-option')).map(item => item.getText());
  }
}
