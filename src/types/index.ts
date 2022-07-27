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
