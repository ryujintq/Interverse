import express from 'express'
import connectDB from './util/connectDB.js'
import cors from 'cors'
import { Server as socketIOServer } from 'socket.io'
import http from 'http'
import dotenv from 'dotenv'
dotenv.config()

//route imports
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import friendRoutes from './routes/friendRoutes.js'
import startSocketIO from './util/startSocketIO.js'

//instance of app and socketio
const app = express()
const server = http.createServer(app)
const io = new socketIOServer(server, { cors: { origin: '*', } })

//database connection
connectDB()

//sockets
startSocketIO(io)

//middleware
app.use(express.json())
app.use(cors())

//routes
app.use('/api/v1/users', authRoutes)
app.use('/api/v1/chats', chatRoutes)
app.use('/api/v1/friends', friendRoutes)

//set app to listen on port
const port = process.env.PORT
server.listen(port, console.log('Server now listening now port', port))
