import Joi from 'joi'

export default Joi.object().keys({
  id: Joi.string().required()
})
