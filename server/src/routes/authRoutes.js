import express from 'express'
import User from '../models/user.js'
import encryptPassword from '../util/encryptPassword.js'
import bcrypt from 'bcryptjs'
import genToken from '../util/genToken.js'
import languageCodes from '../util/languageCodes.js'
import sendEmail from '../util/sendEmail.js'

const router = express.Router()

//@route    POST /api/v1/users/signup
//@desc     user sign up
//@body     username, email, password, language
//@access   Public
router.post('/signup', async (req, res) => {
    const { incomingUsername: username, email, password, language } = req.body

    const languageCode = languageCodes[language]

    try {
        const user = new User({
            username,
            email: email.toLowerCase(),
            language: languageCode
        })
        user.password = await encryptPassword(password)

        await user.save()

        sendEmail(user.email, user.id)

        return res.status(200).json({ status: 'success' })
    } catch (err) {
        if (err.code === 11000 && err.keyValue.username) {
            return res.status(422).json({ status: 'fail', message: 'Username already in use' })
        }
        else if (err.code === 11000 && err.keyValue.email) {
            return res.status(422).json({ status: 'fail', message: 'Email already in use' })
        }
        else if (err.errors[Object.keys(err.errors)[0]].kind === 'required') {
            return res.status(400).json({ status: 'fail', message: 'Please fill all fields' })
        }
        return res.status(500).json({ status: 'error', message: 'Something went wrong with the server' })
    }
})

//@route    POST /api/v1/users/login
//@desc     user login
//@body     email, password
//@access   Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email: email.toLowerCase() }).lean()
        if (!user) {
            return res.status(422).json({ status: 'fail', message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(422).json({ status: 'fail', message: 'Invalid credentials' })
        }

        if (!user.isVerified) {
            return res.status(422).json({ status: 'fail', message: 'Please verify your email' })
        }

        const token = genToken(user._id)

        return res.status(200).json({ status: 'success', data: { token, id: user._id, username: user.username } })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong with the server' })
    }
})

router.get('/verify/:id', async (req, res) => {
    const id = req.params.id

    try {
        const user = await User.findById(id)

        if (!user) {
            return res.send('Please make sure you copied the whole and that you have not modified it in any way')
        }

        user.isVerified = true

        await user.save()

        return res.send('Your email has been verified, please login to start using Interverse')
    } catch (error) {
        return res.send('Something went wrong with the server, please try again later')
    }
})

export default router
