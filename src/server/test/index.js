'use strict';

const should = require('chai').should();
const request = require('supertest-as-promised');
const config = require('../../../config.json');
const ApplicationClass = require('../ApplicationTest');

let Application = new ApplicationClass(config);
Application.run();


/**
 * Function which drop database to prepare  tests
 * @param done
 */
function dropDatabase(done) {
  Application.mongoose.connection.db.dropDatabase(err => {
    if (err) {
      throw err;
    }
    if (typeof done === 'function') {
      done();
    }
  });
}
dropDatabase();

describe('> Application', () => {
  const agent = request.agent(Application.app);
  const url = '/api/v' + Application.config.api.version;

  it('# should exist', done => {
    should.exist(Application.app);
    done();
  });

  ['init', 'auth', 'user', 'org', 'ot', 'item', 'setting'].forEach(spec => {
    require('./scenarios/' + spec + '.specs')(agent, url, Application.config);
  });

  after('# should drop database', done => {
    dropDatabase(done);
  });
});