const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your client app's origin
    methods: ["GET", "POST"]
  }
});

// Endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Signaling server is running');
});

// Manage socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle incoming call
  socket.on('callUser', ({ calleeID, offer }) => {
    console.log(`Calling user: ${calleeID}`);
    io.to(calleeID).emit('incomingCall', { callerID: socket.id, offer });
  });

  // Handle answer to a call
  socket.on('answerCall', ({ callerID, answer }) => {
    console.log(`Answering call for: ${callerID}`);
    io.to(callerID).emit('callAnswered', { answer });
  });

  // Handle ICE candidate exchange
  socket.on('iceCandidate', ({ targetID, candidate }) => {
    console.log(`Sending ICE candidate to: ${targetID}`);
    io.to(targetID).emit('iceCandidate', { candidate });
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
