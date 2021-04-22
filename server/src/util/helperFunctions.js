import Chat from '../models/chat.js'

export const updateUnreads = async (index, chatId) => {
    const update = {}
    update[`usersInfo.${index}.noOfUnreads`] = 1
    await Chat.findByIdAndUpdate(chatId, { $inc: update })
}