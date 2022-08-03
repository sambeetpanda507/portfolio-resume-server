export type productType = {
  img: string
  title: string
  count: number
  mrp: number
  price: number
  details: string
}

export type orderType = {
  _id: string
  userId: string
  productId: string
  quantity: number
  amount: number
}

export type cartType = {
  title: string
  count: number
  mrp: number
  price: number
}

export type paymentType = {
  _id: string
  paymentId: string
  amount: number
  currency: string
  email: string
  contact: string
  orders: cartType[]
}
