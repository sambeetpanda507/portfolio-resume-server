import Joi from 'joi'

export default Joi.object().keys({
  img: Joi.string().required(),
  title: Joi.string().required(),
  mrp: Joi.number().required(),
  price: Joi.number().required(),
  details: Joi.string().required()
})
