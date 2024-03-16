// express GWT protect api in server
// npm i express-jwt

const expressjwt = require('express-jwt')
function authJwt() {
    const secret = process.env.secret ? process.env.secret : 'web-app-ecommerce'
    const api = process.env.API_URL
    return expressjwt({
        secret,
        // thuật toán mã hóa
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            `${api}/user/login`,
            `${api}/user/register`,
        ],
    })
}

async function isRevoked (req, payload, done) {
    if(!payload.is_admin) done(null, true)
    done();
}
module.exports = authJwt
