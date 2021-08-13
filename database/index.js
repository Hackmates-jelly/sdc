/* eslint-disable camelcase */
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'prestoncarroll',
  password: '',
  database: 'qa',
});

client.connect();

const getQuestions = async (product_id, page, count) => {
  const text = 'SELECT id, body, date_written, asker_name, helpful, reported FROM questions where product_id=($1) ORDER BY id ASC LIMIT ($2)';
  const values = [product_id, count];
  const result = await client.query(text, values);
  return result.rows;
};

const getAnswers = (question_id) => {
  const text = 'SELECT id, body, date_written, answerer_name, helpful FROM answers where question_id=($1) ORDER BY id ASC)';
  const values = [question_id];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((result) => resolve(result.rows))
      .catch((err) => reject(err));
  });
};

const getPhotos = (answer_id) => {
  const text = 'SELECT url FROM answers_photos where answer_id=($1) ORDER BY id ASC';
  const values = [answer_id];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((result) => resolve(result.rows))
      .catch((err) => reject(err));
  });
};

module.exports.getQuestions = getQuestions;
module.exports.getAnswers = getAnswers;
module.exports.getPhotos = getPhotos;
