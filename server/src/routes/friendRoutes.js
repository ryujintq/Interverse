import express from 'express'
import User from '../models/user.js'

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.id }, 'friends friendsRequests sentRequests').lean()

        return res.status(200).json({
            status: 'success',
            data: {
                friends: user.friends,
                friendsRequests: user.friendsRequests,
                sentRequests: user.sentRequests
            }
        })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err })
    }
})

router.post('/add/:id', async (req, res) => {
    try {
        //requester, user added to sentRequests list
        await User.findOneAndUpdate(
            { _id: req.id },
            {
                $push: { sentRequests: req.params.id }
            }
        )

        //requestee, user added to requests list
        await User.findOneAndUpdate(
            { _id: req.params.id },
            {
                $push: { requests: req.id }
            }
        )
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err })
    }
})

router.post('/accept/:id', async (req, res) => {
    try {
        //requestee, user moved from requests list to friends list
        await User.findOneAndUpdate(
            { _id: req.id },
            {
                $pull: { requests: { userId: req.params.id } },
                $push: { friends: req.params.id }
            }
        )

        //requester, user moved from sentRequests list to friends list
        await User.findOneAndUpdate(
            { _id: req.params.id },
            {
                $pull: { sentRequests: { userId: req.id } },
                $push: { friends: req.id }
            }
        )

        return res.status(200).json({ status: 'success' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err })
    }
})

router.post('/deny/:id', async (req, res) => {
    try {
        //requestee, user removed from requests list
        await User.findOneAndUpdate(
            { _id: req.id },
            {
                $pull: { requests: { userId: req.params.id } }
            }
        )

        //requester, user removed from sentRequests list
        await User.findOneAndUpdate(
            { _id: req.params.id },
            {
                $pull: { sentRequests: { userId: req.id } }
            }
        )

        return res.status(200).json({ status: 'success' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err })
    }
})

export default router
