import { WwwPage } from './app.po';

describe('www App', function() {
  let page: WwwPage;

  beforeEach(() => {
    page = new WwwPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
