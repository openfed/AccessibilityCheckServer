var Crawler = require('simplecrawler');

/**
 * Performs a crawl
 * @param url {string} - Url to start crawling at.
 * @param depth {int} - How deep to go (-1 = unlimited, 0 = current page only).
 * @return Crawler crawler object.
 */
function crawl(url, depth) {
  // Initialize crawler.
  var crawler = Crawler(url)
    .on('fetchcomplete', function (queueItem, responseBuffer, response) {
      console.log('Crawled: ', queueItem.url);
    });

  // Set up configuration.
  if (depth > -1) {
    crawler.maxDepth = depth;
  }

  crawler.maxConcurrency = 1;
  crawler.supportedMimeTypes = [
    /^text\/html/i,
    /^application\/(html|xhtml)?[\+\/\-]?xml/i,
  ];
  crawler.downloadUnsupported = false;

  // Skip static assets. (Maybe not needed because we already skip their MIME types?)
  crawler.addFetchCondition(function (parsedURL) {
    if (parsedURL.path.match(/\.(css|jpg|pdf|docx|js|png|ico|svg|xml|gif)(\?.*)?$/i)) {
      console.log('Skipped URL: ', parsedURL.path);
      return false;
    }

    return true;
  });

  // Start crawling.
  console.log('Crawling URL: ' + url);
  crawler.start();
  return crawler;
}

module.exports = crawl;
