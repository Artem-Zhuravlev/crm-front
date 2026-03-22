export type Payment = {
  id?: string
  clientId: string
  amount: number
  date: string
  method?: string
}

export type PaymentFormValues = {
  id?: string
  clientId: string
  amount: number
  date: string
  time: string
  method: string
}

export type PaymentPayload = {
  clientId: string
  amount: number
  date: string
  method?: string
}
