// ! module imports
const express = require('express')
const dotenv = require('dotenv').config()
const connectDB = require('./config/db')
const errorHandler = require('./middlewares/errorMiddleware')
const cors = require('cors');
const session = require("express-session")
const { Server, Socket } = require('socket.io')
const socketIo_Config = require('./utils/socket')
const http = require("http");


const app = express()

// ! cors setup
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);

// ! parsers
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(express.static('public/'))
app.use('/api/chatMedia/',express.static('public/chat/'))

// ! session
app.use(
    session({
        secret: process.env.SESSION_SECRET || "default_secret_key",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

// ! create http server
const server = http.createServer(app)

const io = new Server(server, {
    cors: { origin: "http://localhost:3000" }
})

// Configure Socket.IO
socketIo_Config(io);


// ! db connecting
connectDB();
const port = process.env.PORT || 5000

// ! routes
app.use('/api/', require('./routes/userRoutes'))
app.use('/api/post', require('./routes/postRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/connection', require('./routes/connectionRoutes'))
app.use('/api/chat', require('./routes/chatRoutes'))
app.use('/api/story', require('./routes/storyRoutes'))

// ! error middleware
app.use(errorHandler)

// ! server
server.listen(port, () => console.log(`server is running on ${port}`))