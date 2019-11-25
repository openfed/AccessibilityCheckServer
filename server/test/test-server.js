process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const myApp = require('../app');

const { app } = myApp;
const { server, wss } = myApp;
const should = chai.should();
let sender;
let receiver;

let client;

const WebSocket = require('ws');
chai.use(chaiHttp);
let testPort;

function sendMessage(client, type, payload) {
  client.send(
    JSON.stringify({
      type,
      payload,
    }),
  );
}

describe('Server', () => {
  it('should list all standards on /standards GET', (done) => {
    chai.request(server)
      .get('/standards')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.should.include.members(['Section508', 'WCAG2A', 'WCAG2AA', 'WCAG2AAA']);
        done();
      });
  });
});

describe('Test page', () => {
  it('should deliver a test page', (done) => {
    chai.request(server)
      .get('/test1.html')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
});

describe('URL crawling', () => {
  

  beforeEach((done) => {
    server.close();
    server.listen(0, () => {
      testPort = wss.address().port;
      client = new WebSocket(`http://localhost:${testPort}`);
      client.on('open', () => {
        done();
      });
    });
  });

  afterEach((done) => {
    // kill WebSocket after each test
    client.terminate();
    done();
  });

  describe('Status alerts', () => {
    it('Clients should receive the correct notifications.', function (done) {
      this.timeout(30000);
      let checks = 0;
      const testUrl = `http://localhost:${testPort}/test1.html`;

      function check() {
        checks++;
        if (checks === 5) {
          done();
        }
      }

      sendMessage(client, 'crawl-url', {
        url: testUrl,
        standard: 'WCAG2AA',

        // Only check the given URL.
        crawlDepth: '1',
      });

      let i = 0;

      client.on('message', (message) => {
        const parsed = JSON.parse(message);
        
        const data = parsed.payload;
        const type = parsed.type;

        if (type === 'crawl-url-status') {
          data.should.have.property('status');
          if (i === 0) {
            data.status.should.equal('started');
            check();
          } else if (i === 1) {
            data.status.should.equal('complete');
            check();
          }

          i++;
        }
        
        else if (type === 'sniff-loading') {
          // Test the "loading" message for an individual sniff.
          data.should.have.property('url');
          data.url.should.equal(testUrl);
          check();
        }

        else if (type === 'crawled-url') {
          data.should.equal(testUrl);
          check();
        }

        else if (type === 'sniff-result') {
          data.should.have.property('url');
          data.should.have.property('result');
          data.url.should.equal(testUrl);
          data.result.should.be.a('array');

          // Check that we have at least 2 issues.
          data.result.length.should.be.above(1);
          data.result[0].should.have.property('code');
          data.result[0].should.have.property('context');
          data.result[0].should.have.property('message');
          data.result[0].should.have.property('selector');
          data.result[0].should.have.property('type');
          data.result[0].should.have.property('typeCode');
          check();
        }
      });
    });
  });

  describe('Crawl depth', function () {
    this.timeout(30000);

    beforeEach((done) => {
      server.close();
      server.listen(0, () => {
        testPort = wss.address().port;
        client = new WebSocket(`http://localhost:${testPort}`);
        client.on('open', () => {
          done();
        });
      });
    });
  
    afterEach((done) => {
      // kill WebSocket after each test
      client.terminate();
      done();
    });
  
    it('should not go any levels deep if requested', (done) => {
      sendMessage(client, 'crawl-url', {
        url: `http://localhost:${testPort}/test1.html`,
        standard: 'WCAG2AA',

        // Only check the given URL.
        crawlDepth: '1',
      });

      let count = 0;
      client.on('message', (message) => {
        const parsed = JSON.parse(message);
        
        const data = parsed.payload;
        const type = parsed.type;

        if (type === 'sniff-result') {
          data.should.have.property('url');
          data.should.have.property('result');
          count++;
     
        } else if (type === 'crawl-url-status') {
          if (data.status === 'complete') {
            count.should.equal(1);
            done();
          }
        }
      });
    });

    it('should go only 1 level deep if requested', (done) => {
      sendMessage(client, 'crawl-url', {
        url: `http://localhost:${testPort}/test1.html`,
        standard: 'WCAG2AA',

        // Only check the given URL.
        crawlDepth: '2',
      });

      let count = 0;
      client.on('message', (message) => {
        const parsed = JSON.parse(message);
        
        const data = parsed.payload;
        const type = parsed.type;

        if (type === 'sniff-result') {
          data.should.have.property('url');
          data.should.have.property('result');
          count++;
        }
        else if (type === 'crawl-url-status') {
          if (data.status === 'complete') {
            count.should.equal(2);
            done();
          }
        }
      });
    });

    it('should go all levels deep if requested', (done) => {
      sendMessage(client, 'crawl-url', {
        url: `http://localhost:${testPort}/test1.html`,
        standard: 'WCAG2AA',

        // Only check the given URL.
        crawlDepth: '-1',
      });

      let count = 0;
      client.on('message', (message) => {
        const parsed = JSON.parse(message);
        
        const data = parsed.payload;
        const type = parsed.type;

        if (type === 'sniff-result') {
          data.should.have.property('url');
          data.should.have.property('result');
          count++;
        }

        else if (type === 'crawl-url-status') {
          if (data.status === 'complete') {
            count.should.equal(3);
            done();
          }
        }
      });
    });
  });

  describe('Abortion', function () {
    this.timeout(30000);

    beforeEach((done) => {
      server.close();
      server.listen(0, () => {
        testPort = wss.address().port;
        client = new WebSocket(`http://localhost:${testPort}`);
        client.on('open', () => {
          done();
        });
      });
    });
  
    afterEach((done) => {
      // kill WebSocket after each test
      client.terminate();
      done();
    });
  
    it('should abort if requested', (done) => {
      const testUrl = `http://localhost:${testPort}/test1.html`;

      sendMessage(client, 'crawl-url', {
        url: testUrl,
        standard: 'WCAG2AA',

        // Only check the given URL.
        crawlDepth: '1',
      });

      client.on('sniff-result', (data) => {
        // This should never happen.
        true.should.equal(false);
      });

      sendMessage(client, 'abort', {});
      let i = 0;
      client.on('crawl-url-status', (data) => {
        data.should.have.property('status');
        if (i === 0) {
          data.status.should.equal('started');
        } else if (i === 1) {
          data.status.should.equal('aborted');
        }

        i++;
      });

      // Give ourselves 5 seconds to receive a result.
      setTimeout(done, 5000);
    });
  });
});
