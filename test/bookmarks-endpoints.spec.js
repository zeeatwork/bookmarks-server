const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');
const app = require('../src/app');

describe('Bookmarks Endpoints', () => {
  describe('GET /bookmarks', () => {
    it('should return an empty json array', () =>
    return supertest(app)
      .get('/bookmarks')
      .expect(200, []);
      
      let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connecton: process.env.TEST_DB_URL,
    });
  });
  after('disconnect from db', () => db.destroy())
  before('clean the table', () => db('bookmarks').truncate())
});


/*describe('POST/bookmarks', () => {
  it('should return 201, add article to db, and return article', function() {
    this.retries(3);

    const requestBody = {
      title: 'bookmark title',
      url: 'bookmark url',
      rating: 'bookmark rating',
      description: 'bookmark description',
    };

    return supertest(app)
      .post('/bookmarks')
      .send(requestBody)
      .expect(201)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body.title).to.eql(requestBody.title);
        expect(res.body.url).to.eql(requestBody.url);
        expect(res.body.rating)'to.eql(requestBody.rating);
        expect(res.body.id).to.exist;

      })
  })
})