import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    name: String,
    languages: [String],
    lastUpdated: Date
})

export default mongoose.model('Chat', chatSchema)
