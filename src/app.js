const express = require('express');
const { getMyDetails, validateRule } = require('./controller');
const { validate, checkObjKeyLength } = require('./validate')

// Set up express app
const app = express();

const port = process.env.PORT || 5000;

// Parse the body of incoming requests
app.use((req, res, next) => {
  express.json()(req, res, err => {
    if (err) {
      return res.status(400).json({
        message: 'Invalid JSON payload passed.',
        status: 'error',
        data: null
      })
    }

    next();
  });
});
// Routes
app.get('/', getMyDetails);
app.post('/validate-rule', validate, validateRule);

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
      status: 'error',
      data: err.data
      });
  }
  console.log(err)
    res.status(500).json({
    message: err.message,
    status: 'error',
    data: null
  })
}

app.use(errorHandler)
// Start server
app.listen(port, () => {
  console.log(`Express server listening on ${port}`);
});

module.exports = app;