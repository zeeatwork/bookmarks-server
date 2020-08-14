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
}];
[{
  id: 2,
  title: 'Yahoo Link', 
  url: 'http://www.yahoo.com',
  description: 'a link to yahoo',
  rating: 2
}];
[{
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

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if(!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
});

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
app.get('/bookmarks', (req, res) => {
  res
    .json(bookmarkList);
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


module.exports = app;