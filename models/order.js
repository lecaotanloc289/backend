const mongoose = require('mongoose')

const order_schema = mongoose.Schema({
    orderItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            require: true,
        },
    ],
    shippingAddress1: {
        type: String,
        require: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        require: true,
    },
    zip: {
        type: String,
        require: true,
    },
    country: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        require: true,
        default: 'Pending',
    },
    shipping: {
        type: Object,
    },
    payment: {
        type: Object,
    },
    note: {
        type: String,
        default: '',
    },
    totalPrice: {
        type: Number,
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
})

/* Giá của sp tùy thuộc vào mỗi thời điểm chứ không thể lấy id trỏ về giá được.
Order Example 
{
  "order_id": "123456789",
  "customer_id": "987654321",
  "items": [
    {
      "product_id": "product_001",
      "quantity": 2,
      "price": 25.99
    },
    {
      "product_id": "product_002",
      "quantity": 1,
      "price": 39.99
    }
  ],
  "total_price": 91.97,
  "status": "pending",
  "shipping_address": {
    "street": "123 Main Street",
    "city": "Anytown",
    "state": "ST",
    "postal_code": "12345",
    "country": "USA"
  },
  "payment": {
    "method": "credit_card",
    "card_type": "Visa",
    "card_number": "**** **** **** 1234",
    "expiration_date": "12/24",
    "billing_address": {
      "street": "456 Maple Avenue",
      "city": "Anytown",
      "state": "ST",
      "postal_code": "54321",
      "country": "USA"
    }
  },
  "created_at": "2024-02-06T12:30:45Z",
  "updated_at": "2024-02-06T12:30:45Z"
}

*/

// using to get id, not _id
order_schema.virtual('id').get(function () {
    return this._id.toHexString()
})

order_schema.set('toJSON', {
    virtuals: true,
})

exports.Order = mongoose.model('Order', order_schema)
exports.order_schema = order_schema
