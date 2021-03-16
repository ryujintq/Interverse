import express from 'express'
import requireAuth from '../middleware/requireAuth.js'
import Chat from '../models/chat.js'
import Message from '../models/message.js'
import User from '../models/user.js'

const router = express.Router()

//@route    GET /api/v1/chats
//@desc     get all chats for user
//@access   Private
router.get('/', requireAuth, async (req, res) => {
    try {
        const chats = await Chat.find({ users: req.id })
        return res.status(200).json({ status: 'success', data: { chats } })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: err })
    }
})

//@route    GET /api/v1/chats/:id
//@desc     get all messages of a specific chat
//@param    chat id
//@access   Private
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.id }, 'sender messages timestamp').lean()
        const chat = await Chat.findById(req.params.id).lean().populate('users', 'username')
        const user = await User.findById(req.id).lean()

        for (let i = 0, iEnd = messages.length; i < iEnd; i++) {
            for (let j = 0, jEnd = messages[i].messages.length; j < jEnd; j++) {
                if (messages[i].messages[j].language === user.language) {
                    messages[i].messages = messages[i].messages[j].content
                }
            }
        }

        return res.status(200).json({ status: 'success', data: { messages, chat } })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong with the server' })
    }
})

//@route    POST /api/v1/chats
//@desc     create a new chat
//@body     username
//@access   Private
router.post('/', requireAuth, async (req, res) => {
    const { userIds, incomingName } = req.body //userIds of users to add, name of chat

    try {
        const user = await User.findById(req.id, '_id username language').lean()

        console.log('hello')

        const users = [user]
        const languages = [user.language]

        for (let i = 0, iEnd = userIds.length; i < iEnd; i++) {
            const userToAdd = await User.findOne({ _id: userIds[i] }, '_id username language').lean()

            if (!userToAdd) {
                return res.status(404).json({ status: 'fail', message: `User ${userIds[i]} does not exist` })
            }

            users.push(userToAdd)

            if (!languages.includes(userToAdd.language)) {
                languages.push(userToAdd.language)
            }
        }

        const chat = new Chat({
            users,
            name: incomingName,
            languages,
            lastUpdated: new Date()
        })

        await chat.save()

        return res.status(200).json({ status: 'success', data: { name: chat.name, _id: chat._id } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 'error', message: 'Something went wrong with the server' })
    }
})

//@route    POST /api/v1/chats
//@desc     create a message in specific chat
//@body     message, timestamp
//@param    chatId
//@access   Private
// router.post('/:id', requireAuth, async (req, res) => {
//     const { incomingMessage, timestamp } = req.body
//     const user = req.id

//     try {
//         const chat = await Chat.findById(req.params.id).lean()
//         const messages = []

//         chat.languages.forEach(async language => {
//             const tranlatedText = await translate(incomingMessage, language)
//             messages.push({ language, content: tranlatedText })
//         })

//         const message = new Message({
//             chat,
//             user,
//             messages,
//             timestamp
//         })

//         await message.save()

//         return res.status(200).json({ status: 'success' })
//     } catch (err) {
//         return res.status(500).json({ status: 'error', message: 'Something went wrong with the server' })
//     }
// })

export default router
