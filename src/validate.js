
makeBadRequestError = (message, data) => {
  const error = new Error(message)
  error.status = 400
  error.data = data
  return error
}

validate = (req, res, next) => {
    const { body } = req
    parseRequired(body, res)
    const { data, rule } = body
    let dataValue
    if(isNaN(rule)) {
      dataValue = extractDataValue(data, rule.field)
    } else {
      throw makeBadRequestError('rule should be an object.')
    }
    if (!dataValue) {
      throw makeBadRequestError(`field ${rule.field} is missing from data.`)
    }
    const operatorHandler = operators[rule.condition]
    if(!operatorHandler) throw makeBadRequestError('Accepted condition values are: eq, neq, gte, gt and contains.', null)
    if (!operatorHandler(dataValue, rule)) {
      const msg ={
        'data': {
          'validation': {
            'error': false,
            'field': rule.field,
            'field_value': dataValue,
            'condition': rule.condition,
            'condition_value': rule.condition_value
          }
        }
      }
      throw makeBadRequestError(`field ${rule.field} failed validation.`, msg)
    }
    next()
}

function parseRequired(body) {
    const expectedKeys = ['data', 'rule']
    const missingFields = expectedKeys.filter((key) => !Object.keys(body).includes(key))
    if (missingFields.length) {
      throw makeBadRequestError(`${missingFields[0]} is required.`)
    }
}

const operators = {
  eq: (dataValue, rule) => {
    const { lhs, rhs } = parseAndValidate(dataValue, rule)
    return lhs === rhs
  },
  neq: (dataValue, rule) => {
    const { lhs, rhs } = parseAndValidate(dataValue, rule)
    return lhs !== rhs
  },
  gte: (dataValue, rule) => {
    const { lhs, rhs } = parseAndValidate(dataValue, rule)
    return lhs >= rhs
  },
  gt: (dataValue, rule) => {
    const { lhs, rhs } = parseAndValidate(dataValue, rule)
    return lhs > rhs
  },
  contains: (dataValue, rule) => {
    // lhs can be a string or an array
    const lhs = parseContainsDataValue(dataValue)
    const { condition_value: conditionValue } = rule
    const rhs = parseValue(conditionValue)
    return lhs.includes(rhs)
  }
}

const parseValue = (value) => {
  // attempt to parse field as a number
  let parsedValue = parseFloat(value) || parseInt(value)
  // if NaN then return as is(might be a string)
  if (Number.isNaN(parsedValue)) {
    return value;
  } else {
    return parsedValue;
  }
}

const parseAndValidate = (dataVAlue, rule) => {
  const lhs = parseValue(dataVAlue)
  const { condition_value: conditionValue } = rule
  const rhs = parseValue(conditionValue)
  if (typeof lhs !== typeof rhs) {
    const error = new Error(`${rule.field} should be a|an ${typeof rhs}.`)
    error.status = 400
    throw error
  }

  return { lhs, rhs }
}

const parseContainsDataValue = (dataValue) => {
  if (!(Array.isArray(dataValue) || typeof dataValue === "string")) {
    const error = new Error(`contains condition not supported for dataValue: ${dataValue}`)
    error.status = 400
    throw error
  }

  return dataValue
}

const extractDataValue = (data, field) => {
  const keys = field.split('.')
  if (keys.length > 2) {
    const error = new Error('Nesting should not be more than 2 levels.')
    error.status = 400
    throw error
  }

  let result = data[keys[0]]
  return keys.length > 1 ? result[keys[1]] : result
}

const checkObjKeyLength = (rule, data) => {
  const keys = rule.field.split('.')
    let value
    if (keys.length > 1) {
      const arr = keys.splice(0);
      value = data[arr[0]][arr[1]]
    } else {
        value = data[rule.field]
    }
    return value
}
module.exports = { checkObjKeyLength, validate }