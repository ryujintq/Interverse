import bcrypt from 'bcryptjs'

const encryptPassword = async plainText => {
    const salt = await bcrypt.genSalt(10)
    const encrypted = await bcrypt.hash(plainText, salt)

    return encrypted
}

export default encryptPassword
