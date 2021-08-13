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

// PARAMS
// product_id
// page
// count
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

  const questionsArr = await db.getQuestions(product_id, page, count);

  questionsArr.forEach((question) => {
    // questions
    const newQuestionObj = {};
    newQuestionObj["question_id"] = question.id;
    newQuestionObj["question_body"] = question.body;
    const qDate = new Date(parseInt(question.date_written, 10));
    newQuestionObj["question_date"] = qDate.toISOString();
    newQuestionObj["asker_name"] = question.asker_name;
    newQuestionObj["question_helpfulness"] = question.helpful;
    newQuestionObj["reported"] = question.reported >= 1;

    // answers
    const answersObj = {};
    // let answersRows;
    db.getAnswers(question.id)
      .then((answerResult) => {
        const answersRows = answerResult;
        answersRows.forEach((answer) => {
          const oneAnswer = {};
          oneAnswer["id"] = answer.id;
          oneAnswer["body"] = answer.body;
          const aDate = new Date(parseInt(question.date_written, 10));
          oneAnswer["date"] = aDate.toISOString();
          oneAnswer["answerer_name"] = answer.answerer_name;
          oneAnswer["helpfulness"] = answer.helpful;
          // photos
          db.getPhotos(answer.id)
            .then((photoResult) => {
              const photoRows = photoResult;
              const photos = [];
              photoRows.forEach((row) => {
                photos.push(row.url);
              });
              oneAnswer["photos"] = photos;
              answersObj[answer.id] = oneAnswer;
            })
            .catch((err) => {
              console.error(err);
              // res.send(err);
            });
        });
      })
      .catch((err) => {
        console.error(err);
        // res.send(err);
      });

    newQuestionObj["answers"] = answersObj;
    resultsArr.push(newQuestionObj);
  });

  returnData["results"] = resultsArr;

  res.send(returnData);
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  const { question_id } = req.params;
  const { page } = req.query;
  const { count } = req.query;

  res.send({ hi: question_id });
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

// app.get('/questions', (req, res) => {
//   $.ajax({
//     method: 'GET',
//     url: `https://app-hrsei-api.herokuapp.com/api/fec2/hr-sea/qa/questions?product_id=${req.query.productId}&page=1&count=50`,
//     success: (data) => {
//       res.send(data);
//     },
//     error: (err) => {
//       res.sendStatus(500, err);
//     }
//   })
// });

// need to listen to:
// /GET questions
// /GET answers
// /POST question
// /POST answer
// /PUT helpful?
// /PUT report?
// /PUT helpfulA
// /PUT reportA
