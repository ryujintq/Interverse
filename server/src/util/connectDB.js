import mongoose from 'mongoose'

const connectDB = () => {
    mongoose.connect(process.env.DB_URL, { autoIndex: true, useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    const db = mongoose.connection

    db.once('open', () => {
        console.log('Connected to database')
    })
}

export default connectDB
