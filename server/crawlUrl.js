const pa11y = require('pa11y');
const async = require('async');
const validUrl = require('valid-url');
const crawl = require('./crawl');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function crawlUrl(data, ws) {
  function sendMessage(type, payload) {
    ws.send(
      JSON.stringify({
        type,
        payload
      })
    );
  }
  // Flag that is set to true whenever we receive the abort signal.
  let aborted = false;

  // The URL to start crawling at.
  const { url } = data;

  // The standard to use.
  const { standard } = data;
  
  // The language to use.
  const language = data.language || 'en';

  // How deep to crawl (-1 is unlimited).
  const depth = data.crawlDepth;

  const queue = async.queue(async function(url) {
    // The queue function will be called with each URL. We
    // can then run the pa11y test function on them and call
    // `done` when we're finished to free up the queue
    sendMessage('sniff-loading', {
      url
    });
    console.log(`Running tests for: ${url}`);

    try {
      // If the aborted flag is set, exit early.
      if (aborted) {
        return;
      }

      // Initialize the Pa11y accessibility test.
      const result = await pa11y(url, {
        chromeLaunchConfig: {
          args: [
              '--no-sandbox',
          ]
        },
        language,
        includeNotices: true,
        includeWarnings: true,

        // Stop loading an individual page after 30 seconds.
        timeout: 30000,
        standard,

        // Log what's happening to the console
        log: {
          debug: console.log.bind(console),
          error: console.error.bind(console),
          info: console.log.bind(console)
        }
      });

      // If the aborted flag is set, exit early.
      if (aborted) {
        return;
      }

      // Emit the result.
      sendMessage('sniff-result', {
        url,
        result: result.issues
      });
    } catch (error) {
      console.error({ error: error.message });
      sendMessage('sniff-error', {
        url,
        error: error.message
      });
    }
  });

  if (!validUrl.isHttpUri(url) && !validUrl.isHttpsUri(url)) {
    console.log(`Invalid url:${url}`);
    return;
  }

  // Start crawling.
  const crawler = crawl(url, depth);

  // Emit the "started" action.
  sendMessage('crawl-url-status', {
    status: 'started'
  });

  const abortListener = function() {
    if (aborted) {
      return;
    }

    console.log('Aborting.');

    // Set aborted flag, so that any currently running jobs will be discarded.
    aborted = true;

    // Stop the crawler.
    crawler.stop();

    // Empty the queue.
    queue.kill();
    sendMessage('crawl-url-status', {
      status: 'aborted'
    });
    console.log('Aborted by user.');
  };

  ws.on('message', message => {
    if (JSON.parse(message).type === 'abort') {
      abortListener();
    }
  });

  const disconnectListener = function() {
    console.log('Disconnecting.');
    crawler.stop();

    // Empty the queue.
    queue.kill();

    // Set aborted flag, so that any currently running jobs will be discarded.
    aborted = true;
    console.log('Aborted by disconnection.');
  };

  ws.on('close', disconnectListener);

  // Whenever we're done crawling, execute the callback.
  crawler.on('complete', () => {
    const complete = function() {
      sendMessage('crawl-url-status', {
        status: 'complete'
      });
      console.log('All items processed.');
    };

    // If there are no running queue items, finish up. Otherwise, set the finish
    // function to run wheneer the queue is empty.
    if (queue.running() === 0) {
      complete();
    } else {
      queue.drain(complete);
    }
  });

  crawler.on('fetchcomplete', queueItem => {
    console.log(`Fetch complete for: ${queueItem.url}`);

    // Exit early if the aborted flag is set.
    if (aborted) {
      return;
    }

    // Emit the crawled URL
    sendMessage('crawled-url', queueItem.url);

    // Run the tests.
    queue.push([queueItem.url]);
  });
}

module.exports = crawlUrl;
