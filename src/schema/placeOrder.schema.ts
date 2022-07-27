import Joi from 'joi'

export default Joi.object().keys({
  amount: Joi.number().required(),
  userId: Joi.string().required(),
  productId: Joi.string().required(),
  quantity: Joi.number().required()
})
