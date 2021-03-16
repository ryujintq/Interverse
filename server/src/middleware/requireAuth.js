import jwt from 'jsonwebtoken'

export default (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ status: 'fail', message: 'You must be logged in' })
    }

    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json({ status: 'fail', message: 'You must be logged in' })
        }

        const { id } = payload
        req.id = id

        next()
    })
}