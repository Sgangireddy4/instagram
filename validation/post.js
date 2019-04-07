const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
  let errors = {};

  data.image = !isEmpty(data.image) ? data.image : '';
  data.caption = !isEmpty(data.caption) ? data.caption : '';

  if (Validator.isEmpty(data.image)) {errors.image = 'Image field is required, give URL'}

  if (!Validator.isLength(data.caption, { min: 10, max: 300 })) {errors.caption = 'Caption must be between 10 and 300 characters';}
  if (Validator.isEmpty(data.caption)) {errors.caption = 'Caption field is required'}

  return {
    errors,
    isValid: isEmpty(errors)
  };
};