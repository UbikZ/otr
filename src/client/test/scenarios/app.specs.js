var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var expect = require('chai').expect;

module.exports = function (stagingUrl, config) {
  describe('> Initialization', function () {
    describe('> Check default urls', function () {
      it('should redirect to "/"', function () {
        browser.get(stagingUrl);

        browser.getCurrentUrl().then(function (url) {
          expect(url).to.equal(stagingUrl.concat('/#/login'));
        });

        browser.get('http://localhost:'.concat(config.env[process.env.NODE_ENV].port, '/#/nonexistantroute'));
        browser.getCurrentUrl().then(function (url) {
          expect(url).to.equal(stagingUrl.concat('/#/login'));
        });
      });
    });
  });
};