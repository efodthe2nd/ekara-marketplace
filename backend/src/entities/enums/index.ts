// src/entities/enums/index.ts
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_IN_ESCROW = 'PAYMENT_IN_ESCROW',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export enum EscrowStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  FUNDS_HELD = 'FUNDS_HELD',
  RELEASED_TO_SELLER = 'RELEASED_TO_SELLER',
  REFUNDED_TO_BUYER = 'REFUNDED_TO_BUYER'
}

export enum BidListingStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  SOLD = 'SOLD'
}

export enum BidStatus {
  ACTIVE = 'ACTIVE',
  WON = 'WON',
  LOST = 'LOST'
}