import User from '../models/user.js'
import Chat from '../models/chat.js'
import translate from "./translate.js"
import Message from '../models/message.js'
import sortFnc from './sortFnc.js'

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
                const userChats = await Chat.find({ users: id }, 'name _id').sort({ lastUpdated: -1 }).lean()

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
            const { chatId, messages, sender, timestamp } = data
            const user = await User.findById(sender.userId)

            try {
                //finds chat and updated lastUpdated variable. Returns updated chat
                const chat = await Chat.findByIdAndUpdate(chatId, { lastUpdated: new Date() }, { new: true }).lean()
                const translatedMessages = []

                //translate the message to all other languages associated with the chat
                //only translate if there is more than one language associated with the chat
                //dont translate if its the senders own language
                if (chat.languages.length > 1) {
                    for (let i = 0, iEnd = chat.languages.length; i < iEnd; i++) {
                        if (chat.languages[i] == user.language) {
                            translatedMessages.push({ language: chat.languages[i], content: messages })
                            continue
                        }
                        const tranlatedText = await translate(messages, chat.languages[i])
                        translatedMessages.push({ language: chat.languages[i], content: tranlatedText })
                    }
                } else {
                    translatedMessages.push({ language: chat.languages[0], content: messages })
                }

                //create the message and save to database
                let newMessage = new Message({
                    chat,
                    sender,
                    messages: translatedMessages,
                    timestamp: new Date()
                })

                await newMessage.save()

                // remove sender from recipients list
                const recipients = chat.users.filter(user => user.toString() !== id.toString())

                //send message to all users that are part of the chat and are online
                let userSocket
                for (let i = 0, iEnd = recipients.length; i < iEnd; i++) {
                    userSocket = connections[recipients[i]]
                    if (userSocket) {
                        const user = await User.findById(recipients[i]).lean()

                        for (let i = 0, iEnd = translatedMessages.length; i < iEnd; i++) {
                            if (translatedMessages[i].language === user.language) {
                                newMessage = {
                                    chat: { _id: chat._id, name: chat.name },
                                    sender,
                                    messages: translatedMessages[i].content,
                                    timestamp
                                }
                                break
                            }
                        }
                        io.to(userSocket).emit('receive-message', newMessage)
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
                const chat = await Chat.findByIdAndUpdate(chatId, { $pull: { users: id } }, { new: true })

                if (chat.users.length <= 0) {
                    chat.deleteOne()
                }

                //THINK ABOUT HOW YOU WANT TO DO THIS
                // for (let i = 0, iEnd = chat.users.length; i < iEnd; i++) {
                //     const userSocketId = connections[chat.users[i]]
                //     if (userSocketId) {
                //         io.to(userSocketId).emit('left-chat', id)
                //     }
                // }
            } catch (error) {
                console.log(error)
            }
        })

        socket.on('add-to-chat', async data => {
            const { chatId, users } = data

            try {
                await Chat.findByIdAndUpdate(
                    chatId,
                    { $push: { users: { $each: [...users] } } },
                    { new: true }
                )
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
            console.log(data)
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
                console.log(userId)
                console.log(connections)
                if (friendSocketId) {
                    console.log('hello? ')
                    io.to(friendSocketId).emit('remove-friend', { userId: id })
                }
            } catch (error) {
                console.log(error)
            }
        })
    })
}

export default startSocketIO
