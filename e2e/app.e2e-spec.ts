import { BosaAccessiblityCheckServerPage } from './app.po';

describe('bosa-accessiblity-check-server App', () => {
  let page: BosaAccessiblityCheckServerPage;

  beforeEach(() => {
    page = new BosaAccessiblityCheckServerPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
