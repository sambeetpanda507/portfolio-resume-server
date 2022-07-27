import Joi from 'joi'

export default Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  avatar: Joi.string().uri()
})
