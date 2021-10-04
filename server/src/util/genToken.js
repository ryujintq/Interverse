import jwt from 'jsonwebtoken'

const genToken = id => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET)
    return token
}

export default genToken
