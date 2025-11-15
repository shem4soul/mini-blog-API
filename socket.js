let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id); // Optional

      // Store reference so controller can use it
      io.currentSocket = socket;
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};

// let io;

// module.exports = {
//   init: (server) => {
//     io = require("socket.io")(server, {
//       cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//       },
//     });

//     return io;
//   },

//   getIO: () => {
//     if (!io) {
//       throw new Error("Socket.io not initialized!");
//     }
//     return io;
//   },
// };
