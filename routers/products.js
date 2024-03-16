// Tạo, Lưu trữ API và nhập xuất giữa các file
const { Product } = require('../models/product')
const { Category } = require('../models/category')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

// upload image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('Invalid image type')

        if (isValid) uploadError = null
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    },
})

const uploadOptions = multer({ storage: storage })

// post a product
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    // Xác thực xem category có tồn tại hay không trước khi gửi request
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')

    const file = req.file
    if (!file) return res.status(400).send('No image in the request!')

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

    // Let, not const
    let product = new Product(
        {
            _id: req.body.id,
            name: req.body.name,
            description: req.body.description,
            image: `${basePath}${fileName}`,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numberReviews: req.body.numberReviews,
            isBestSeller: req.body.isBestSeller,
        },
        {
            new: true,
        },
    )
    new_product = await product.save()
    if (!new_product)
        return res.status(500).send('The product cannot be created!')

    res.send(new_product)
})

// search product
// Tìm kiếm sản phẩm
router.get('/search', async (req, res) => {
    try {
        const { key } = req.query
        const results = await Product.find({
            $or: [
                { name: { $regex: key, $options: 'i' } },
                { description: { $regex: key, $options: 'i' } },
            ],
        })
        res.json(results)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// get all product || by category
router.get(`/`, async (req, res) => {
    // let filter = {}
    // filter = { category: req.query.categories.split(',') }
    const products = await Product.find().populate('category')
    if (!products) res.status(500).json({ success: false })
    res.send(products)
})

// get a product by id and show category details
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')
    if (!product) return res.status(500).json({ success: false })
    res.send(product)
})

// update product by id
router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid product id!')
    }
    // check category before update
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid category')
    let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numberReviews: req.body.numberReviews,
            isBestSeller: req.body.isBestSeller,
        },
        { new: true },
    )

    if (!product) return res.status(500).send('The product cannot be updated!')
    res.send(product)
})

// delete product by id
router.delete('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid product id!')
    }
    Product.findOneAndDelete(req.params.id)
        .then((product) => {
            if (product)
                return res
                    .status(200)
                    .json({ success: true, message: 'The product is deleted!' })
            else
                return res
                    .status(404)
                    .json({ success: false, message: 'Product is not found!' })
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err })
        })
})

// delete all product
router.delete('/delete/all', async (req, res) => {
    try {
        // Xóa tất cả sản phẩm
        await Product.deleteMany({})
        res.status(204).json({
            success: true,
            message: 'Delete all product success!',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Lỗi khi xóa sản phẩm' })
    }
})

// count product
router.get('/get/count', async (req, res) => {
    // count in this table
    const product_count = await Product.countDocuments()
    if (!product_count) res.status(500).json({ success: false })
    res.send({
        product_count: product_count,
    })
})

// get special product on main home page
router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const featured_products = await Product.find({ isFeatured: true }).limit(
        +count,
    )
    if (!featured_products) res.status(500).json({ success: false })
    res.send(featured_products)
})

// upload multiple file - limit at 10
router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            res.status(400).send('Invalid product id!')
        }
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

        const files = req.files
        let imagesPaths = []
        if (files)
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`)
            })
        let product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true },
        )

        if (!product)
            return res.status(500).send('The product cannot be updated!')
        res.send(product)
    },
)
module.exports = router
