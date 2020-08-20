/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const winston = require('winston');
const {v4: uuid} = require('uuid');
const app = express();
const knex = require('knex');
const BookmarksService = require('./bookmarks-service');

// const knexInstance = knex({
//   client: 'pg', 
//   connection: 'postgresql://postgresql@localhost/bookmarks'
// })

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

//set up winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const bookmarkList  = [{
  id: 1,
  title: 'Google Link', 
  url: 'http://www.google.com',
  description: 'a link to google',
  rating: 5
},
{
  id: 2,
  title: 'Yahoo Link', 
  url: 'http://www.yahoo.com',
  description: 'a link to yahoo',
  rating: 2
},
{
  id: 3,
  title: 'Thinkful Link', 
  url: 'http://www.thinkful.com',
  description: 'a link to thinkful',
  rating: 4
}];

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

//create bearer token functtion



app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

// Get bookmarks returns bookmark list
app.get('/bookmarks', (req, res, next) => {
  const knexInstance = req.app.get('db')
  BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmarks => {
      res.json(bookmarks)
    })
    .catch(next);
});
//Get bookmarks id re a single bookmark by id
app.get('/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  const bookmark = bookmarkList.find(b => b.id == id);

  //bookmark id validation
  if (!bookmark) {
    logger.error(`No bookmark matching id ${id} found.`);
    //get bookmarks id error for id not found (404)
    return res
      .status(404)
      .send('Bookmark not found');
  }
  res
    .json(bookmark);
});

//post bookmarks accepts a JSON object accepts user bookmark to add to list
app.post('/bookmarks', (req, res) => {
  const { title, url, description, rating } = req.body;
  //post bookmarks validation 
  if (!title) {
    // eslint-disable-next-line quotes
    logger.error(`Title is required`);
    return res
      .status(400)
      .send('Invalid data');
  }
  
  if (!url) {
    // eslint-disable-next-line quotes
    logger.error(`url is required`);
    return res
      .status(400)
      .send('Invalid data');
  }

  if (!rating) {
    // eslint-disable-next-line quotes
    logger.error(`rating is required`);
    return res
      .status(400)
      .send('Invalid data');
  }

  const id = uuid();
  const bookmark = {
    id,
    title,
    url,
    description,
    rating
  };

  bookmarkList.push(bookmark);

  logger.info(`Bookmark with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:8000/card/${id}`)
    .json(bookmark);
});

//delete bookmarks deletes a bookmark with a given id
app.delete('/bookmarks/:id', (req, res) => {
  const { id } = req.params; 
  const bookmarkIndex = bookmarkList.findIndex(li => li.id == id);

  if (bookmarkIndex === -1) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res
      .status(404)
      .send('Not found');
  }
  bookmarkList.splice(bookmarkIndex, 1);

  logger.info(`Bookmark with id ${id} deleted.`);
  res
    .status(204)
    .end();
});

//console.log(BookmarksService.getAllBookmarks(app.get('db')));
console.log('knex and driver installed coreectly');
module.exports = app;