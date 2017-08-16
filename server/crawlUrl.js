var pa11y = require('pa11y');
var async = require('async');
var validUrl = require('valid-url');
var crawl = require('./crawl');
var config = require('./config');

function crawlUrl(data, socket, io) {
  // Flag that is set to true whenever we receive the abort signal.
  var aborted = false;
  // The URL to start crawling at.
  var url = data.url;
  // The standard to use.
  var standard = data.standard;
  // How deep to crawl (-1 is unlimited).
  var depth = data.crawlDepth;

  // Initialize the Pa11y accessibility test.
  var test = pa11y({
    // The path for HTMLCS.
    htmlcs: config.htmlcs,
    page: {
      settings: {
        loadImages: false
      }
    },
    // Stop loading an individual page after 30 seconds.
    timeout: 30000,
    standard: data.standard,
    // Log what's happening to the console
    log: {
      debug: console.log.bind(console),
      error: console.error.bind(console),
      info: console.log.bind(console)
    }
  });

  // Keeping it simple and setting concurrency for the sniffer to 1 for now.
  var concurrency = 1;
  var queue = async.queue(function(url, done) {
    // The queue function will be called with each URL. We
    // can then run the pa11y test function on them and call
    // `done` when we're finished to free up the queue
    io.to(socket.id).emit('sniff-loading', {
      url: url
    });
    console.log('running tests for: ' + url);
    // Call Pa11y.
    test.run(url, function(error, result) {
      // If the aborted flag is set, exit early.
      if (aborted) {
        done();
        return;
      }
      // Handle the error
      if (error) {
        console.error({ error : error.message });
        io.to(socket.id).emit('sniff-error', {
          url: url,
          error: error.message
        });
        done();
        return;
      }
      // Emit the result.
      io.to(socket.id).emit('sniff-result', {
        url : url,
        result : result
      });
      console.log(result, 'julien');
      done();
    });
  }, concurrency);

  if (!validUrl.isHttpUri(url) && !validUrl.isHttpsUri(url)) {
    console.log('invalid url:' + url);
    return;
  }

  // Start crawling.
  crawler = crawl(url, depth);

  // Emit the "started" action.
  io.to(socket.id).emit('crawl-url-status', {
     status : 'started'
  });

  var abortListener = function (data) {
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
    io.to(socket.id).emit('crawl-url-status', {
      status: 'aborted'
    });
    delete test;
    delete queue;
    socket.removeAllListeners("abort");
    socket.removeAllListeners("disconnect");
    console.log('Aborted by user.');
  };
  socket.on("abort", abortListener);

  var disconnectListener = function () {
    console.log('Disconnecting.');
    crawler.stop();
    // Empty the queue.
    queue.kill();
    delete test;
    delete queue;
    socket.removeAllListeners("abort");
    socket.removeAllListeners("disconnect");
    // Set aborted flag, so that any currently running jobs will be discarded.
    aborted = true;
    console.log('Aborted by disconnection.');
  };
  socket.on('disconnect', disconnectListener);

  // Whenever we're done crawling, execute the callback.
  crawler.on("complete", function () {
    const complete = function () {
      io.to(socket.id).emit('crawl-url-status', {
        status : 'complete'
      });
      console.log('All items processed.');
    };
    // If there are no running queue items, finish up. Otherwise, set the finish function to run wheneer the queue is empty.
    if (queue.running() == 0) {
      complete();
    } else {
      queue.drain = complete;
    }
  });

  crawler.on("fetchcomplete", function (queueItem, responseBuffer, response) {
    // Exit early if the aborted flag is set.
    if (aborted) {
      return;
    }
    // Emit the crawled URL
    io.to(socket.id).emit('crawled-url', queueItem.url);
    // Run the tests.
    queue.push([queueItem.url]);
  });
}

module.exports = crawlUrl;
