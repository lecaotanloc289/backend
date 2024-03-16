const { Cart } = require('../models/cart')
const express = require('express')
const router = express.Router()

// get user's cart by user id
router.get('/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        const cart = await Cart.findById(userId)
            .populate({
                path: 'products.productId',
                model: 'Product',
            })
        return res.status(200).json(cart)
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching cart' })
    }
})

// add to cart | create new if it not exist
router.post('/add', async (req, res) => {
    const userId = req.body.userId
    const productId = req.body.productId
    const quantity = req.body.quantity

    try {
        // Tìm giỏ hàng của người dùng
        let cart = await Cart.findById(userId)

        if (!cart) {
            // Nếu giỏ hàng không tồn tại, tạo mới
            cart = new Cart({ _id: userId, products: [] })
        }

        // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng hay không
        const existingProductIndex = cart.products.findIndex(
            (item) => item.productId.toString() === productId,
        )

        if (existingProductIndex !== -1) {
            // Nếu sản phẩm đã tồn tại, cập nhật số lượng
            cart.products[existingProductIndex].quantity += quantity
        } else {
            // Nếu sản phẩm chưa tồn tại, thêm mới vào mảng products
            cart.products.push({
                productId,
                quantity,
            })
        }

        // Lưu giỏ hàng đã được cập nhật
        await cart.save()

        return res.status(200).json(cart)
    } catch (error) {
        return res.status(500).json({
            error: 'Error adding to cart',
        })
    }
})

// tesst oke http://localhost:2000/api/v1/carts/add
//{
//     "userId": "65c2091dc3e076cc6ae53dc2",
//     "productId": "65db0b69f08a93058c07f04f",
//     "quantity": 1
// }

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/delete/:userId/:productId', async (req, res) => {
    const userId = req.params.userId
    const productId = req.params.productId
    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findById(userId)

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' })
        }

        // Lọc sản phẩm cần xóa khỏi mảng products
        cart.products = cart.products.filter(
            (item) => item.productId._id.toHexString() !== productId,
        )

        // Lưu giỏ hàng đã được cập nhật
        await cart.save()

        // Trả về giỏ hàng đã được cập nhật
        return res.status(200).json(cart)
    } catch (error) {
        return res.status(500).json({
            error: 'Error removing product from cart',
        })
    }
})

// Tăng số lượng sản phẩm trong giỏ hàng
router.put('/increase', async (req, res) => {
    const userId = req.body.userId
    const productId = req.body.productId

    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findById(userId)

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' })
        }

        // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng hay không
        const existingProduct = cart.products.find(
            (item) => item.productId.toString() === productId,
        )

        if (existingProduct) {
            // Tăng số lượng sản phẩm
            existingProduct.quantity += 1

            // Lưu giỏ hàng đã được cập nhật
            await cart.save()

            return res.status(200).json(cart)
        } else {
            return res.status(404).json({ error: 'Product not found in cart' })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            error: 'Error increasing quantity',
        })
    }
})

// Giảm số lượng sản phẩm trong giỏ hàng
router.put('/decrease', async (req, res) => {
    const userId = req.body.userId
    const productId = req.body.productId

    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findById(userId)

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' })
        }

        // Kiểm tra xem sản phẩm có tồn tại trong giỏ hàng hay không
        const existingProduct = cart.products.find(
            (item) => item.productId.toString() === productId,
        )

        if (existingProduct && existingProduct.quantity > 1) {
            // Tăng số lượng sản phẩm
            existingProduct.quantity -= 1

            // Lưu giỏ hàng đã được cập nhật
            await cart.save()

            return res.status(200).json(cart)
        } else {
            return res.status(404).json({ error: 'Product not found in cart' })
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Error increasing quantity',
        })
    }
})

// okey http://localhost:2000/api/v1/carts/decrease
// {
//     "userId": "65c2091dc3e076cc6ae53dc2",
//     "productId": "65db0b69f08a93058c07f04f"
// }

// Xóa nhiều sản phẩm khỏi giỏ hàng
router.post('/delete/:userId', async (req, res) => {
    const userId = req.params.userId
    const productIds = req.body // Danh sách ID sản phẩm cần xóa
    console.log(userId)
    try {
        // Tìm giỏ hàng của người dùng
        const cart = await Cart.findById(userId)

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' })
        }
        // Lọc sản phẩm cần xóa khỏi mảng products
        cart.products = cart.products.filter(
            (item) => !productIds.includes(item.productId._id.toHexString()),
        )
        await cart.save()

        // Trả về giỏ hàng đã được cập nhật
        return res.status(200).json(cart)
    } catch (error) {
        return res.status(500).json({
            error: 'Error removing products from cart',
        })
    }
})

// Xóa tất cả giỏ hàng
router.delete('/delete/all', async (req, res) => {
    try {
        await Cart.deleteMany()
        res.status(204).json({
            success: true,
            message: 'Delete all product success!',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error' })
    }
})
module.exports = router
