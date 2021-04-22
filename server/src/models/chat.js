import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    usersInfo: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            noOfUnreads: {
                type: Number,
                default: 0
            },
            name: String,
            _id: false
        }
    ],
    name: String,
    languages: [String],
    lastUpdated: Date
})

export default mongoose.model('Chat', chatSchema)
