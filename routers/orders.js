const { Order } = require('../models/order')
const express = require('express')
const { OrderItem } = require('../models/order_item')
const { populate } = require('dotenv')
const router = express.Router()

// get all order
router.get(`/`, async (req, res) => {
    const order_list = await Order.find()
        .populate('user orderItems')
        .sort('dateOrdered: -1')
    if (!order_list) res.status(500).json({ success: false })
    res.send(order_list)
})

// get all order of a user by user id
// .populate('user', ['name', 'street', 'city', 'phone'])
router.get(`/:id`, async (req, res) => {
    const order = await Order.find({ user: req.params.id })
        .populate('user', ['name', 'street', 'city', 'phone'])
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
            },
        }).sort('dateOrdered: -1')

    if (!order) res.status(500).json({ success: false })
    res.send(order)
})

// get order by order id
router.get(`/id/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', ['name', 'street', 'city', 'phone'])
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'order',
            },
        })

    if (!order) res.status(500).json({ success: false })
    res.send(order)
})

// create new order
router.post('/', async (req, res) => {
    const orderItems = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            })

            newOrderItem = await newOrderItem.save()
            return newOrderItem._id
        }),
    )
    // list of order items
    const orderItemsIds = await orderItems

    // total price
    const totalPrices = await Promise.all(
        orderItemsIds.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate(
                'product',
                'price',
            )
            var totalPrice = Number(
                orderItem.product.price * orderItem.quantity,
            )
            return totalPrice
        }),
    )

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0)

    let order = new Order(
        {
            _id: req.body.id,
            orderItems: orderItemsIds,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            shipping: req.body.shipping,
            note: req.body.note,
            payment: req.body.payment,
            user: req.body.user,
        },
        {
            new: true,
        },
    )
    order = await order.save()

    if (!order) return res.status(400).send('The order cannot be created!')
    res.send(order)
})

// update order
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        // Lấy dữ liệu trả về là dữ liệu mới đẫ được update
        {
            new: true,
        },
    )
    if (!order) return res.status(404).send('The order cannot be update!')
    res.send(order)
})

// delete order by id
router.delete('/:_id', (req, res) => {
    // Sử dụng findOneAndDelete thay cho findByIdAndRemove
    Order.findOneAndDelete(req.params.id)
        .then(async (order) => {
            if (order) {
                await order.orderItems.map(async (orderItem) => {
                    await OrderItem.findOneAndDelete(orderItem)
                })
                return res
                    .status(200)
                    .json({ success: true, message: 'The order is delete!' })
            } else
                return res
                    .status(404)
                    .json({ success: false, message: 'Order is not found!' })
        })
        .catch((err) => {
            return res.status(400).json({ success: false, error: err })
        })
})

// get total sell
router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: 'totalPrice' } } },
    ])

    if (!totalSales)
        return res.status(400).send('The order sales cannot be generated!')

    res.send({ totalSales: totalSales.pop().totalsales })
})

// count order
router.get('/get/count', async (req, res) => {
    // count in this table
    const order_count = await Order.countDocuments()
    if (!order_count) res.status(500).json({ success: false })
    res.send({
        order_count: order_count,
    })
})

// get order of a user by user_id
router.get(`/get/userorders/:user_id`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.user_id })
        .populate('user', ['name', 'street', 'city', 'phone'])
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category',
            },
        })
        .sort({ dateOrdered: -1 })

    if (!userOrderList) res.status(500).json({ success: false })
    res.send(userOrderList)
})

router.delete('/delete/all', async (req, res) => {
    try {
        await Order.deleteMany({})
        await OrderItem.deleteMany({})
        res.status(204).json({
            success: true,
            message: 'Delete all order and order items success!',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error' })
    }
})
module.exports = router
