/* eslint-disable camelcase */
/* eslint-disable quote-props */
/* eslint-disable dot-notation */
/* eslint-disable quotes */
const express = require('express');
const db = require('../database/index.js');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('client/dist'));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

app.get('/qa/questions', async (req, res) => {
  const { product_id } = req.query;
  let { page } = req.query;
  let { count } = req.query;

  if (count === undefined) {
    count = 5;
  }
  if (page === undefined) {
    page = 1;
  }

  const returnData = { "product_id": product_id.toString() };
  const resultsArr = [];
  const resultsObj = {};
  const answersObj = {};
  const qIds = [];
  const aIds = [];
  const promises = [];
  const promisesPhotos = [];
  const questionsArr = await db.getQuestions(product_id, page, count);

  questionsArr.forEach((question) => {
    const newQuestionObj = {};
    newQuestionObj["question_id"] = question.id;
    qIds.push(question.id);
    newQuestionObj["question_body"] = question.body;
    const qDate = new Date(parseInt(question.date_written, 10));
    newQuestionObj["question_date"] = qDate.toISOString();
    newQuestionObj["asker_name"] = question.asker_name;
    newQuestionObj["question_helpfulness"] = question.helpful;
    newQuestionObj["reported"] = question.reported >= 1;
    newQuestionObj["answers"] = {};
    resultsObj[question.id] = newQuestionObj;

    promises.push(
      db.getAnswersNoLimit(question.id)
        .then((answerRows) => {
          answerRows.forEach((answer) => {
            const oneAnswer = {};
            aIds.push(answer.id);
            oneAnswer["id"] = answer.id;
            oneAnswer["body"] = answer.body;
            const aDate = new Date(parseInt(answer.date_written, 10));
            oneAnswer["date"] = aDate.toISOString();
            oneAnswer["answerer_name"] = answer.answerer_name;
            oneAnswer["helpfulness"] = answer.helpful;
            resultsObj[question.id].answers[answer.id] = oneAnswer;
            answersObj[answer.id] = resultsObj[question.id].answers[answer.id];
          });
        })
        .catch((err) => {
          res.send(err);
        }),
    );
  });

  Promise.all(promises)
    .then(() => {
      aIds.forEach((answerID) => {
        promisesPhotos.push(
          db.getPhotos(answerID)
            .then((photoResult) => {
              const photoRows = photoResult;
              const photosArr = [];
              photoRows.forEach((row) => {
                photosArr.push(row.url);
              });
              answersObj[answerID]["photos"] = photosArr;
            })
            .catch((err) => {
              res.send(err);
            }),
        );
      });
    })
    .then(() => {
      Promise.all(promisesPhotos)
        .then(() => {
          Object.keys(resultsObj).forEach((key) => {
            resultsArr.push(resultsObj[key]);
          });
          returnData["results"] = resultsArr;
          res.send(returnData);
        });
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get('/qa/questions/:question_id/answers', async (req, res) => {
  const { question_id } = req.params;
  let { page } = req.query;
  let { count } = req.query;

  if (count === undefined) {
    count = 5;
  }
  if (page === undefined) {
    page = 1;
  }

  const returnData = { "question": question_id.toString(), "page": page, "count": count };
  const resultsArr = [];
  const resultsObj = {};
  const aIds = [];
  const promises = [];
  const answersArr = await db.getAnswers(question_id, count);

  answersArr.forEach((answer) => {
    const newAnswerObj = {};
    newAnswerObj["answer_id"] = answer.id;
    aIds.push(answer.id);
    newAnswerObj["body"] = answer.body;
    const aDate = new Date(parseInt(answer.date_written, 10));
    newAnswerObj["date"] = aDate.toISOString();
    newAnswerObj["answerer_name"] = answer.answerer_name;
    newAnswerObj["helpfulness"] = answer.helpful;
    newAnswerObj["photos"] = {};
    resultsObj[answer.id] = newAnswerObj;

    promises.push(
      db.getPhotos(answer.id)
        .then((photoResult) => {
          const photoRows = photoResult;
          const photosArr = [];
          photoRows.forEach((row) => {
            photosArr.push(row.url);
          });
          resultsObj[answer.id]["photos"] = photosArr;
        })
        .catch((err) => {
          res.send(err);
        }),
    );
  });

  Promise.all(promises)
    .then(() => {
      Object.keys(resultsObj).forEach((key) => {
        resultsArr.push(resultsObj[key]);
      });
      returnData["results"] = resultsArr;
      res.send(returnData);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.post('/qa/questions', (req, res) => {
  const { body } = req.body;
  const { name } = req.body;
  const { email } = req.body;
  const { product_id } = req.body;

  res.send({
    body, name, email, product_id,
  });
});

app.post('/qa/questions/:question_id/answers', (req, res) => {
  const { question_id } = req.params;
  const { body } = req.body;
  const { name } = req.body;
  const { email } = req.body;
  const { photos } = req.body;

  // res.send({ hi: '123' });
});

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  const { question_id } = req.params;
  // res.send({ hi: '123' });
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  const { question_id } = req.params;
  // res.send({ hi: '123' });
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  const { answer_id } = req.params;
  // res.send({ hi: '123' });
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  const { answer_id } = req.params;
  // res.send({ hi: '123' });
});

// need to listen to:
// /GET questions
// /GET answers
// /POST question
// /POST answer
// /PUT helpful?
// /PUT report?
// /PUT helpfulA
// /PUT reportA
