var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var onlineUsers = {}; // object to store online users

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("a user connected");

  socket.on("set username", function (username) {
    console.log("set username: " + username);

    // set the socket's username property
    socket.username = username;

    // add the user to the online users object
    onlineUsers[socket.username] = socket.id;

    // emit user joined event with the new user's username
    io.emit("user joined", {
      username: socket.username,
      onlineUsers: Object.keys(onlineUsers),
    });
  });

  socket.on("disconnect", function () {
    console.log("user disconnected");

    // remove the user from the online users object
    delete onlineUsers[socket.username];

    // emit user left event with the disconnected user's username
    io.emit("user left", {
      username: socket.username,
      onlineUsers: Object.keys(onlineUsers),
    });
  });

  socket.on("chat message", function (message) {
    console.log("message: " + message);

    // emit chat message event with the message and username
    io.emit("chat message", {
      username: socket.username,
      message: message,
    });
  });

  // listen for user typing event
  socket.on("user typing", function () {
    // broadcast to all clients except the one who is typing
    socket.broadcast.emit("user typing", socket.username);
  });

  // listen for user stopped typing event
  socket.on("user stopped typing", function () {
    // broadcast to all clients except the one who stopped typing
    socket.broadcast.emit("user stopped typing", socket.username);
  });
});

http.listen(3000, function () {
  console.log("listening on *:3000");
});
