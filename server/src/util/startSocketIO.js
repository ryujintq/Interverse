import User from '../models/user.js'
import Chat from '../models/chat.js'
import Message from '../models/message.js'
import translate from '../util/translate.js'
import sortFnc from './sortFnc.js'
import { updateUnreads } from './helperFunctions.js'

const startSocketIO = io => {
    //array of connected users
    const connections = {}

    //io listeners
    io.on('connection', async socket => {
        const id = socket.handshake.query.id

        //add user to connection list
        connections[id] = socket.id

        //send user their chat and friend lists
        socket.on('request-user-data', async () => {
            try {
                const user = await User.findById(id, { 'friends': 1, 'friendRequests': 1, 'sentRequests': 1, '_id': 0 }).lean()
                const userChats = await Chat.find({ 'usersInfo.user': id }, 'name _id usersInfo').sort({ lastUpdated: -1 }).lean()

                //replaces all userInfos in chat with the specific user's noOfReads
                for (let i = 0, iEnd = userChats.length; i < iEnd; i++) {
                    const index = userChats[i].usersInfo.findIndex(userInfo => userInfo.user == id)
                    userChats[i].noOfUnreads = userChats[i].usersInfo[index].noOfUnreads
                    if (userChats[i].usersInfo[index].name) {
                        userChats[i].name = userChats[i].usersInfo[index].name
                    }
                    delete userChats[i].usersInfo
                }

                //sort lists alphabetically
                user.friends.sort(sortFnc)
                user.friendRequests.sort(sortFnc)
                user.sentRequests.sort(sortFnc)

                const data = {
                    friendsData: user,
                    chatData: userChats
                }

                socket.emit('get-user-data', data)
            } catch (error) {
                console.log(error)
                socket.emit('error-message', 'Something went wrong with the server')
            }
        })

        //user sends message in a chat
        socket.on('send-message', async data => {
            const { chatId, messages, sender } = data

            try {
                //finds chat and updated lastUpdated variable. Returns updated chat
                const chat = await Chat.findByIdAndUpdate(chatId, { lastUpdated: new Date() }, { new: true }).lean()
                const user = await User.findById(sender.userId, 'language').lean()
                const translatedMessages = await translate(chat.languages, messages, user.language)

                const timestamp = new Date()

                //create the message and save to database
                let newMessage = new Message({
                    chat,
                    sender,
                    messages: translatedMessages,
                    originalMessage: messages,
                    timestamp
                })

                await newMessage.save()

                // remove sender from recipients list
                const recipients = chat.usersInfo.filter(userInfo => userInfo.user.toString() !== id.toString())

                //send message to all users that are part of the chat
                //udpate unreads in chat in database
                //if user is online, emit
                let userSocketId
                for (let i = 0, iEnd = recipients.length; i < iEnd; i++) {
                    userSocketId = connections[recipients[i].user]
                    const recipient = await User.findById(recipients[i].user).lean()
                    if (userSocketId) {
                        for (let i = 0, iEnd = translatedMessages.length; i < iEnd; i++) {
                            if (translatedMessages[i].language === recipient.language) {
                                newMessage = {
                                    chat: { _id: chat._id, name: chat.usersInfo > 2 ? chat.name : sender.username },
                                    sender,
                                    messages: translatedMessages[i].content,
                                    timestamp
                                }
                                break
                            }
                        }
                        io.to(userSocketId).emit('receive-message', newMessage)
                    }

                    if (!recipient.lastChatOpened || recipient.lastChatOpened.toString() !== chat._id.toString()) {
                        const index = chat.usersInfo.findIndex(userInfo => userInfo.user == recipients[i].user)
                        updateUnreads(index, chatId)
                    }
                }
            } catch (error) {
                console.log(error)
                socket.emit('error-message', 'Something went wrong with the server')
            }
        })

        socket.on('leave-chat', async data => {
            const { chatId } = data
            try {
                let chat = await Chat.findByIdAndUpdate(chatId, { $pull: { usersInfo: { user: id } } }, { new: true })

                //if no users left in the chat, delete it and all messages
                if (chat.usersInfo.length <= 0) {
                    await chat.deleteOne()
                    await Message.deleteMany({ chat: chatId })
                    return
                }

                const user = await User.findById(id, '_id username language').lean()

                //update chat languages 
                const languages = []
                for (let i = 0, iEnd = chat.usersInfo.length; i < iEnd; i++) {
                    const userToAdd = await User.findById(chat.usersInfo[i].user, 'language').lean()
                    if (!languages.includes(userToAdd.language)) {
                        languages.push(userToAdd.language)
                    }
                }
                const isMultiLanguage = chat.languages > 1
                chat = await Chat.findByIdAndUpdate(chatId, { languages, isMultiLanguage }, { new: true }).lean()

                const translatedMessages = await translate(chat.languages, `${user.username} has left the chat`, user.language)

                const timestamp = new Date()

                //create the message and save to database
                let newMessage = new Message({
                    chat,
                    sender: { username: 'Interverse' },
                    messages: translatedMessages,
                    timestamp
                })
                await newMessage.save()

                //send message to all users that are part of the chat
                //if user is online, emit
                //if user is offline, udpate unreads in chat
                let userSocketId
                for (let i = 0, iEnd = chat.usersInfo.length; i < iEnd; i++) {
                    const recipient = await User.findById(chat.usersInfo[i].user, 'lastChatOpened language').lean()
                    userSocketId = connections[chat.usersInfo[i].user]
                    if (userSocketId) {
                        for (let i = 0, iEnd = translatedMessages.length; i < iEnd; i++) {
                            if (translatedMessages[i].language === recipient.language) {
                                newMessage = {
                                    chat: { _id: chat._id, name: chat.name },
                                    sender: { username: 'Interverse' },
                                    messages: translatedMessages[i].content,
                                    timestamp
                                }
                                break
                            }
                        }
                        io.to(userSocketId).emit('left-chat', { id, message: newMessage })
                    }
                    if (!recipient.lastChatOpened || recipient.lastChatOpened.toString() !== chat._id.toString()) {
                        const index = chat.usersInfo.findIndex(userInfo => userInfo.user.toString() == recipient._id.toString())
                        updateUnreads(index, chatId)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        })

        socket.on('add-to-chat', async data => {
            try {
                const { chatId, users } = data

                const user = await User.findById(id, 'language').lean()

                const usersObjArr = [] //user objs to push into chat.usersInfo
                const usersIdArr = [] //ids used to find all users to add
                let message = '' //construct message to broadcast

                for (let i = 0, iEnd = users.length; i < iEnd; i++) {
                    usersObjArr.push({ user: users[i].userId })
                    usersIdArr.push(users[i].userId)
                    message = message.concat(`${users[i].username}, `)
                }
                message = message.slice(0, -2)

                let chat = await Chat.findByIdAndUpdate(
                    chatId,
                    { $push: { usersInfo: { $each: [...usersObjArr] } } },
                    { new: true }
                ).lean()

                //update chat languages 
                const languages = []
                for (let i = 0, iEnd = usersIdArr.length; i < iEnd; i++) {
                    const userToAdd = await User.findById(usersIdArr[i], 'language').lean()
                    if (!chat.languages.includes(userToAdd.language)) {
                        languages.push(userToAdd.language)
                    }
                }

                const isMultiLanguage = chat.languages > 1
                chat = await Chat.findByIdAndUpdate(chatId, { isMultiLanguage, $push: { languages: { $each: [...languages] } } }, { new: true }).lean()

                const translatedMessages = await translate(chat.languages, `${message} ${users.length > 1 ? 'have' : 'has'} been added to the chat`, user.language)

                const timestamp = new Date()

                const usersAdded = await User.find({ _id: { $in: [...usersIdArr] } }, 'username')

                //create the message and save to database
                let newMessage = new Message({
                    chat: chatId,
                    sender: { username: 'Interverse' },
                    messages: translatedMessages,
                    timestamp
                })
                await newMessage.save()

                //send message to all users that are part of the chat
                //if user is online, emit
                //if user is offline, update unreads in chat
                let userSocketId
                for (let i = 0, iEnd = chat.usersInfo.length; i < iEnd; i++) {
                    const recipient = await User.findById(chat.usersInfo[i].user, 'lastChatOpened language').lean()
                    userSocketId = connections[chat.usersInfo[i].user]
                    if (userSocketId) {
                        for (let i = 0, iEnd = translatedMessages.length; i < iEnd; i++) {
                            if (translatedMessages[i].language === recipient.language) {
                                newMessage = {
                                    chat: { _id: chat._id, name: chat.name },
                                    sender: { username: 'Interverse' },
                                    messages: translatedMessages[i].content,
                                    timestamp
                                }
                                break
                            }
                        }
                        io.to(userSocketId).emit('added-to-chat', { users: usersAdded, message: newMessage })
                    }
                    if (!recipient.lastChatOpened || recipient.lastChatOpened.toString() !== chat._id.toString()) {
                        const index = chat.usersInfo.findIndex(userInfo => userInfo.user.toString() == recipient._id.toString())
                        updateUnreads(index, chatId)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        })

        socket.on('add-friend', async data => {
            const { friendName } = data
            try {
                const user = await User.findById(id)
                const friend = await User.findOne({ username: friendName })

                if (!friend) {
                    return io.to(connections[id]).emit('add-friend-error', `${friendName} does not exist`)
                }

                if (user.username === friend.username) {
                    return io.to(connections[id]).emit('add-friend-error', `Cant add yourself`)
                }

                for (let i = 0, iEnd = friend.friendRequests.length; i < iEnd; i++) {
                    if (friend.friendRequests[i].userId.toString() === id.toString()) {
                        return io.to(connections[id]).emit('add-friend-error', `${friendName} is already added`)
                    }
                }

                for (let i = 0, iEnd = user.friends.length; i < iEnd; i++) {
                    if (user.friends[i].userId.toString() === friend._id.toString()) {
                        return io.to(connections[id]).emit('add-friend-error', `${friendName} is already added`)
                    }
                }

                user.sentRequests.push({ userId: friend._id, username: friend.username })
                friend.friendRequests.push({ userId: user._id, username: user.username })

                //if the friend is online, send the requester's data
                const friendSocketId = connections[friend._id]
                if (friendSocketId) {
                    io.to(friendSocketId).emit('friend-request-received', { userId: user._id, username: user.username })
                }

                io.to(connections[id]).emit('friend-request-sent', { userId: friend._id, username: friend.username })

                await Promise.all([user.save(), friend.save()])
            } catch (error) {
                socket.emit('error-message', 'Something went wrong with the server')
            }
        })

        socket.on('accept-friend-request', async data => {
            const { userId } = data

            try {
                const user = await User.findById(id)
                const friend = await User.findById(userId)

                user.friends.push({ userId: friend._id, username: friend.username })
                user.friendRequests = user.friendRequests.filter(request => request.userId.toString() !== friend._id.toString())

                friend.friends.push({ userId: user._id, username: user.username })
                friend.sentRequests = friend.sentRequests.filter(request => request.userId.toString() !== user._id.toString())

                await Promise.all([user.save(), friend.save()])

                const friendSocketId = connections[friend._id]
                if (friendSocketId) {
                    io.to(friendSocketId).emit('friend-request-accepted', { userId: user._id, username: user.username })
                }
            } catch (error) {
                socket.emit('error-message', 'Something went wrong with the server')
            }
        })

        socket.on('deny-friend-request', async data => {
            const { userId } = data

            try {
                const user = await User.findById(id)
                const friend = await User.findById(userId)

                user.friendRequests = user.friendRequests.filter(request => request.userId.toString() !== friend._id.toString())
                friend.sentRequests = friend.sentRequests.filter(request => request.userId.toString() !== user._id.toString())

                await Promise.all([user.save(), friend.save()])

                //if friend is online, notify them
                const friendSocketId = connections[friend._id]
                if (friendSocketId) {
                    io.to(friendSocketId).emit('friend-request-denied', { userId: user._id, username: user.username })
                }
            } catch (error) {
                socket.emit('error-message', 'Something went wrong with the server')
            }
        })

        socket.on('remove-friend', async data => {
            const { userId } = data
            try {
                //friend removed from user's list
                await User.findOneAndUpdate(
                    { _id: id },
                    {
                        $pull: { friends: { userId } }
                    }
                )

                //user removed from friend's list
                await User.findOneAndUpdate(
                    { _id: userId },
                    {
                        $pull: { friends: { userId: id } }
                    }
                )

                //if friend is online, notify them
                const friendSocketId = connections[userId]

                if (friendSocketId) {
                    io.to(friendSocketId).emit('remove-friend', { userId: id })
                }
            } catch (error) {
                console.log(error)
            }
        })

        socket.on('disconnect', async () => {
            await User.findByIdAndUpdate(id, { $set: { lastChatOpened: null } })
            delete connections[id]
            console.log(id + ' has disconnected')
        })
    })
}

export default startSocketIO
