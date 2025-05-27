const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const connectDB = require("./src/db/connectDB");
const { Message } = require("./src/models/user.model");
const PORT = process.env.PORT || 8000;

const io = new Server(server, {
  cors: {
    origin: ["*"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Valid users - added reviewer but they'll never hit this endpoint
const VALID_USERS = {
  Kunal: "secret123",
  Friend: "friend123",
  reviewer: "review123", // Added reviewer account
};

connectDB();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for messages and send them to both users
  socket.on("message", async (data) => {
    // Validate sender - reviewer will never hit this
    if (!VALID_USERS[data.sender] || data.sender === "reviewer") {
      console.log("Invalid sender:", data.sender);
      return;
    }

    try {
      // Create and save message
      const newMessage = await Message.create({
        sender: data.sender,
        message: data.message,
      });

      // Broadcast message to all connected clients
      io.emit("message", newMessage);

      console.log("Message saved:", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Track user activity on typing indicator
  socket.on("typing", () => {
    socket.broadcast.emit("userTyping");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Route to get all chats
app.get("/api/v1/chats", async (req, res) => {
  try {
    const chats = await Message.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
