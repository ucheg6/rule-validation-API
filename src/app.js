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
  const { rule, data } = req.body
  if (res.headersSent) {
    return next(err)
  }

  if (err.status) {
    const failedValidation = err.message.includes('failed validation')
    const fieldValue = checkObjKeyLength(rule, data)
   const responseData = { 
     'validation' : {
      'error': true,
      'field': rule.field,
      'field_value': fieldValue,
      'condition': rule.condition,
      'condition_value': rule.condition_value
    } 
  }
    return res.status(err.status).json({
      message: err.message,
      status: 'error',
      data: failedValidation ? responseData : null
      });
  }

  res.status(500).json({
    message: 'Internal server error',
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