import Joi from 'joi'

export default Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  avatar: Joi.string().uri(),
  password: Joi.string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must be atleast 8 characters long with at least one letter, one number and one special character.'
    })
})
