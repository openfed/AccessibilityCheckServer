process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var myApp = require('../app');
var app = myApp.app;
var server = myApp.server;
var should = chai.should();
var ioOptions = {
 transports: ['websocket'],
 forceNew: true,
 reconnection: false,
 'force new connection': true
};
var sender;
var receiver;
var io = require('socket.io/node_modules/socket.io-client');

chai.use(chaiHttp);

describe('server', function() {
  it('should list all standards on /standards GET', function(done) {
    chai.request(server)
    .get('/standards')
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body.should.include.members([ 'Section508', 'WCAG2A', 'WCAG2AA', 'WCAG2AAA' ]);
      done();
    });
  })
});

describe('test page', function() {
  it('should deliver a test page', function (done) {

    chai.request(server)
    .get('/test1.html')
    .end(function(err, res){
      res.should.have.status(200);
      done();
    });
  });
});

describe('server sockets', function() {
  beforeEach(function(done){
    client = io('http://localhost:' +  server.address().port + '/', ioOptions);
    done();
  });
  afterEach(function(done){
    // disconnect io client after each test
    client.disconnect();
    done();
  });


  describe('Status alerts', function(){
    it('Clients should receive started and complete notifications at the beginning and end of a crawl.', function(done){
      this.timeout(30000);
      let checks = 0;
      let testUrl = 'http://localhost:' +  server.address().port + '/test1.html';

      function check() {
        checks++;
        if (checks == 5) {
          done();
        }
      }

      client.emit('crawl-url', {
        url: testUrl,
        standard: 'WCAG2AA',
        // Only check the given URL.
        crawlDepth: '1'
      });

      let i = 0;
      // Test the "started" and "complete" messages.
      client.on('crawl-url-status', function (data) {
        data.should.have.property('status');
        if (i == 0) {
          data.status.should.equal('started');
          check();
        } else if (i == 1) {
          data.status.should.equal('complete');
          check();
        }
        i++;
      });

      // Test the "loading" message for an individual sniff.
      client.on('sniff-loading', function (data) {
        data.should.have.property('url');
        data.url.should.equal(testUrl);
        check();
      });

      client.on('crawled-url', function (data) {
        data.should.equal(testUrl);
        check();
      });

      client.on('sniff-result', function (data) {
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
      });
    });
  });

  describe('Crawl depth', function () {

  });

});
