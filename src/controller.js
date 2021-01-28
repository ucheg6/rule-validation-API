const { myDetails } = require('./data')
const { checkObjKeyLength } = require('./validate')

const getMyDetails = (req, res) => {
    return res.status(200).json({
        message: 'My Rule-Validation API',
        status: 'success',
        data: myDetails
      });
}

const validateRule = (req, res) => {
    const { rule, data } = req.body
    const fieldValue = checkObjKeyLength(rule, data)
    return res.status(201).json({
      message: `field ${rule.field} successfully validated.`,
      status: 'success',
      'data': {
        'validation': {
          'error': false,
          'field': rule.field,
          'field_value': fieldValue,
          'condition': rule.condition,
          'condition_value': rule.condition_value
        }
      }
    });
}
module.exports = {
    getMyDetails, validateRule
}