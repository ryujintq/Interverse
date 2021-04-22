import express from 'express'
import requireAuth from '../middleware/requireAuth.js'
import Chat from '../models/chat.js'
import Message from '../models/message.js'
import User from '../models/user.js'

const router = express.Router()

//@route    GET /api/v1/chats/:id
//@desc     get all messages of a specific chat
//@param    chat id
//@access   Private
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.id }, 'sender messages timestamp originalMessage').sort({ timestamp: 1 }).limit(30).lean()
        const chat = await Chat.findById(req.params.id, 'usersInfo.user usersInfo.name name').lean().populate('usersInfo.user', 'username').lean()
        const user = await User.findByIdAndUpdate(req.id, { $set: { lastChatOpened: chat._id } })

        for (let i = 0, iEnd = messages.length; i < iEnd; i++) {
            for (let j = 0, jEnd = messages[i].messages.length; j < jEnd; j++) {
                if (messages[i].messages[j].language === user.language) {
                    messages[i].messages = messages[i].messages[j].content
                }
            }
        }

        chat.users = []
        chat.usersInfo.forEach(userInfo => chat.users.push(userInfo.user))

        const index = chat.usersInfo.findIndex(userInfo => userInfo.user._id == req.id)
        const update = {}
        update[`usersInfo.${index}.noOfUnreads`] = 0
        await Chat.findByIdAndUpdate(req.params.id, { $set: update })
        if (chat.usersInfo[index].name) {
            chat.name = chat.usersInfo[index].name
        }

        delete chat.usersInfo

        return res.status(200).json({ status: 'success', data: { messages, chat } })
    } catch (err) {
        console.log(err)
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
        //if group chat
        if (userIds.length > 1) {

            const user = await User.findById(req.id, '_id language username').lean()

            const chatUsers = [{ _id: user._id, username: user.username }]
            const users = [{ user }]
            const languages = [user.language]

            for (let i = 0, iEnd = userIds.length; i < iEnd; i++) {
                const userToAdd = await User.findById(userIds[i], '_id language username').lean()

                if (!userToAdd) {
                    return res.status(404).json({ status: 'fail', message: `User ${userIds[i]} does not exist` })
                }

                users.push({ user: userToAdd })
                chatUsers.push({ _id: userToAdd._id, username: userToAdd.username })

                if (!languages.includes(userToAdd.language)) {
                    languages.push(userToAdd.language)
                }
            }

            const chat = new Chat({
                usersInfo: users,
                name: incomingName,
                languages,
                lastUpdated: new Date(),
            })

            await chat.save()

            return res.status(200).json({ status: 'success', data: { name: chat.name, _id: chat._id, users: chatUsers } })
        }

        //if chat includes only two people
        //if chat between the two already exists, send error message
        const doesChatExist = await Chat.findOne({
            "$and": [
                { "usersInfo.user": { "$all": [req.id, userIds[0]] } },
                { "usersInfo": { "$size": 2 } }
            ]
        })

        if (doesChatExist) {
            return res.status(500).json({ status: 'fail', message: `You already have a chat with selected user` })
        }

        const user = await User.findById(req.id, '_id language username').lean()
        const userToAdd = await User.findById(userIds[0]).lean()

        const usersInfo = [{ user, name: userToAdd.username }, { user: userToAdd, name: user.username }]
        const languages = [user.language, userToAdd.language]
        const chatUsers = [{ _id: user._id, username: user.username }, { _id: userToAdd._id, username: userToAdd.username }]

        const chat = new Chat({
            usersInfo,
            languages,
            lastUpdated: new Date()
        })

        await chat.save()

        chat.name = userToAdd.username

        return res.status(200).json({ status: 'success', data: { name: chat.name, _id: chat._id, users: chatUsers } })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 'error', message: 'Something went wrong with the server' })
    }
})

export default router
