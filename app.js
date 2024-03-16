const express = require('express')
const app = express()
// sử dụng để chuyển dữ liệu nhận được => Json
const bodyParser = require('body-parser')

// ghi nhật ký các yêu cầu http từ UI
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')

// Lỗi không sử dụng được
// const authJwt = require('./helper/jwt')
// const error_handler = require('./helper/error-handler').default
// import authJwt from './helper/jwt'

app.use(cors())
app.options('*', cors())
require('dotenv/config')

// middleware
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
// app.use(authJwt)
// app.use(error_handler);

// Routers
const product_router = require('./routers/products')
const category_router = require('./routers/categories')
const order_router = require('./routers/orders')
const user_router = require('./routers/users')
const cartRouter = require('./routers/carts')

const api = process.env.API_URL

app.use(`${api}/products`, product_router)
app.use(`${api}/users`, user_router)
app.use(`${api}/orders`, order_router)
app.use(`${api}/categories`, category_router)
app.use(`${api}/carts`, cartRouter)

// mongodb connect
mongoose
    .connect(process.env.CONNECTION_STRING, {
        dbName: 'ecommerce',
    })
    .then(() => {
        console.log('Database connection is ready')
    })
    .catch((err) => {
        console.log(err)
    })

const port = process.env.PORT // Replace 2000 with this

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
