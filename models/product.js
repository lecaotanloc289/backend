const mongoose = require('mongoose')

// Create schema
const product_schema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        default: '',
    },
    images: [
        {
            type: String,
            default: '',
        },
    ],
    brand: {
        type: String,
        default: '',
    },
    price: [
        {
            type: Number,
            default: 0,
        },
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        require: true,
    },
    countInStock: {
        type: Number,
        require: true,
        min: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numberReviews: {
        type: Number,
        default: 0,
    },
    isBestseller: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

product_schema.virtual('id').get(function () {
    return this._id.toHexString()
})

product_schema.set('toJSON', {
    virtual: true,
})

// Sử dụng Product trong tất cả các file của project | Global
exports.Product = mongoose.model('Product', product_schema)
exports.product_schema = product_schema
