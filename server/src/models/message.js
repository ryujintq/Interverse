import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    sender: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: {
            type: String
        },
        _id: false
    },
    messages: [
        {
            language: {
                type: String
            },
            content: {
                type: String
            },
            _id: false
        }
    ],
    originalMessage: String,
    timestamp: {
        type: String,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        index: true
    }
})

export default mongoose.model('Message', messageSchema)
