const Crawler = require('simplecrawler');
const uri = require('urijs');

/**
 * Performs a crawl
 * @param url {string} - Url to start crawling at.
 * @param depth {int} - How deep to go (-1 = unlimited, 0 = current page only).
 * @return Crawler crawler object.
 */
function crawl(url, depth, id) {
  // Initialize crawler.
  const crawler = Crawler(url).on('fetchcomplete', (queueItem, responseBuffer, response) => {
    console.log(`[${id}] Crawled: `, queueItem.url);
  });
  const initialSubPath = uri(url).path();

  var originalEmit = crawler.emit;
  crawler.emit = function(evtName, queueItem) {
      crawler.queue.countItems({ fetched: true }, function(err, completeCount) {
          if (err) {
              throw err;
          }
  
          crawler.queue.getLength(function(err, length) {
              if (err) {
                  throw err;
              }
  
              console.log(`[${id}] fetched %d of %d — %d open requests, %d open listeners`,
                  completeCount,
                  length,
                  crawler._openRequests.length,
                  crawler._openListeners);
          });
      });
  
      console.log(`[${id}]`, evtName, queueItem ? queueItem.url ? queueItem.url : queueItem : null);
      originalEmit.apply(crawler, arguments);
  };
  crawler.getRequestOptions = function(queueItem) {
    const requestOptions = Crawler.prototype.getRequestOptions.call(this, queueItem);
    if (requestOptions.headers.cookie === '') {
      delete requestOptions.headers.cookie;
    }
    return requestOptions;
  };

  // Set up configuration.
  if (depth > -1) {
    console.log(`[${id}] Setting max depth to:`, depth);
    crawler.maxDepth = depth;
  }

  crawler.maxConcurrency = 1;
  crawler.supportedMimeTypes = [/^text\/html/i, /^application\/(html|xhtml)?[\+\/\-]?xml/i];
  crawler.downloadUnsupported = false;

  // Skip static assets. (Maybe not needed because we already skip their MIME types?)
  crawler.addFetchCondition(parsedURL => {
    if (parsedURL.path.match(/\.(css|jpg|pdf|docx|js|png|ico|svg|xml|gif)(\?.*)?$/i)) {
      console.log(`[${id}] Skipped URL: `, parsedURL.path);
      return false;
    }

    return true;
  });


  // Skip items that do not start with initial path
  crawler.addFetchCondition(parsedURL => {
    if (!parsedURL.uriPath.startsWith(initialSubPath)) {
      console.log(`[${id}] Skipped URL (no sub-path match for ${initialSubPath}): `, parsedURL.uriPath, );
      return false;
    }

    return true;
  });

  // Start crawling.
  console.log(`[${id}] Crawling URL: ${url}`);
  crawler.start();
  return crawler;
}

module.exports = crawl;
