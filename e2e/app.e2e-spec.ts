import { BosaAccessiblityCheckServerPage } from './app.po';

describe('bosa-accessiblity-check-server App', () => {
  let page: BosaAccessiblityCheckServerPage;

  beforeEach(() => {
    page = new BosaAccessiblityCheckServerPage();
  });

  it('should display the page title', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Accessibility Check (Beta)');
  });
});
