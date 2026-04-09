require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postRoutes = require('./routes/postRoutes');
const placesRoutes = require('./routes/placesRoutes');
const chatRoutes = require('./routes/chatRoutes');
const buddyRoutes = require('./routes/buddyRoutes');
const destinationRoutes = require('./routes/destinationRoutes');

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // React frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/packngopro')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Static Folder for Images
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/buddies', buddyRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/destinations', destinationRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is running correctly.' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);
  
  socket.on('join_chat', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User connected to group room ${groupId}`);
  });

  socket.on('send_message', async (data) => {
    const { sender, receiver, group, text } = data;
    const Message = require('./models/Message');
    
    try {
      if (group) {
        const newMessage = await Message.create({ sender, group, text });
        io.to(group).emit('receive_group_message', newMessage);
      } else {
        const newMessage = await Message.create({ sender, receiver, text });
        io.to(receiver).emit('receive_message', newMessage);
        io.to(sender).emit('receive_message', newMessage);
      }
    } catch (err) {
      console.error('Error saving socket message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve Frontend static files in Production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
