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
  const text = 'SELECT id, body, date_written, asker_name, helpful, reported FROM questions where product_id=($1) ORDER BY id ASC OFFSET ($2) LIMIT ($3)';
  const offset = count * (page - 1);
  const values = [product_id, offset, count];
  const result = await client.query(text, values);
  return result.rows;
};

const getAnswersNoLimit = (question_id) => {
  const text = 'SELECT id, body, date_written, answerer_name, helpful FROM answers where question_id=($1) ORDER BY id ASC';
  const values = [question_id];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((result) => resolve(result.rows))
      .catch((err) => reject(err));
  });
};

const getAnswers = (question_id, page, count) => {
  const text = 'SELECT id, body, date_written, answerer_name, helpful FROM answers where question_id=($1) ORDER BY id ASC OFFSET ($2) LIMIT ($3)';
  const offset = count * (page - 1);
  const values = [question_id, offset, count];

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

const addQuestion = (product_id, body, date, name, email, reported, helpful) => {
  const text = 'INSERT INTO QUESTIONS (product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES (($1), ($2), ($3), ($4), ($5), ($6), ($7))';
  const values = [product_id, body, date, name, email, reported, helpful];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((result) => resolve(result))
      .catch((err) => reject(err));
  });
};

const addAnswer = (question_id, body, date, name, email, reported, helpful, photos) => {
  const text = 'INSERT INTO ANSWERS (question_id, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES (($1), ($2), ($3), ($4), ($5), ($6), ($7)) RETURNING id';
  const values = [question_id, body, date, name, email, reported, helpful];
  const promises = [];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((answerResult) => {
        const { id } = answerResult.rows[0];
        photos.forEach((photoUrl) => {
          const photosText = 'INSERT INTO ANSWERS_PHOTOS (answer_id, url) VALUES (($1), ($2))';
          const photosValues = [id, photoUrl];
          promises.push(
            client.query(photosText, photosValues),
          );
        });

        Promise.all(promises)
          .then(() => {
            resolve('success');
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

const questionHelpful = (question_id) => {
  const text = 'UPDATE questions SET helpful = helpful + 1 WHERE id = ($1)';
  const values = [question_id];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((result) => resolve(result.rows))
      .catch((err) => reject(err));
  });
};

const reportQuestion = (question_id) => {
  const text = 'UPDATE questions SET reported = reported + 1 WHERE id = ($1)';
  const values = [question_id];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((result) => resolve(result.rows))
      .catch((err) => reject(err));
  });
};

const answerHelpful = (answer_id) => {
  const text = 'UPDATE answers SET helpful = helpful + 1 WHERE id = ($1)';
  const values = [answer_id];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((result) => resolve(result.rows))
      .catch((err) => reject(err));
  });
};

const reportAnswer = (answer_id) => {
  const text = 'UPDATE answers SET reported = reported + 1 WHERE id = ($1)';
  const values = [answer_id];

  return new Promise((resolve, reject) => {
    client.query(text, values)
      .then((result) => resolve(result.rows))
      .catch((err) => reject(err));
  });
};

module.exports.getQuestions = getQuestions;
module.exports.getAnswers = getAnswers;
module.exports.getAnswersNoLimit = getAnswersNoLimit;
module.exports.getPhotos = getPhotos;
module.exports.addQuestion = addQuestion;
module.exports.addAnswer = addAnswer;
module.exports.questionHelpful = questionHelpful;
module.exports.reportQuestion = reportQuestion;
module.exports.answerHelpful = answerHelpful;
module.exports.reportAnswer = reportAnswer;
