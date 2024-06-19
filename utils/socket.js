let User = require('../models/userModel')


const socketIo_Config = (io) => {
  let users = [];

  io.on("connect", (socket) => {
    console.log("A client connected");
    io.emit("welcome", "this is server hi socket");

    socket.on("disconnect", () => {
      let disconnectTime = new Date()
      let user = users.find((user) => user.socketId === socket.id);
      if (user) {
        User.findByIdAndUpdate(
          user?.userId,
          { lastSeen: disconnectTime },
          { new: true, useFindAndModify: false }
        )
          .then(updatedUser => {
            console.log('User lastSeen updated:', updatedUser);
          })
      }
      console.log("A client disconnected", user?.userId);
    });

    const removeUser = (socketId) => {
      users = users.filter((user) => user.socketId !== socketId);
    };

    const addUser = (userId, socketId) => {
      !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
    };

    const getUser = (userId) => {
      return users.find((user) => user.userId === userId);
    };

    //when connect
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
    });

    // send and get message
    socket.on(
      "sendMessage",
      ({
        senderId,
        receiverId,
        text,
        messageType,
        file
      }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("getMessage", {
          senderId,
          text,
          messageType,
          file
        });
      }
    );


    socket.on(
      "sendNotification",
      ({
        receiverId,
        senderName,
        message,
      }) => {
        // console.log('hihi', receiverId, senderName, message);
        const user = getUser(receiverId);
        // console.log('user',user);
        io.to(user?.socketId).emit("getNotifications", {
          senderName,
          message,
        });
      }
    );

    // Listen for "typing" event from client
    socket.on(
      "typing",
      ({ senderId, recieverId }) => {
        const user = getUser(recieverId);
        console.log('typing',user);
        if (user) {
          io.to(user.socketId).emit("userTyping", { senderId });
        }
      }
    );

    // Listen for "stopTyping" event from client
    socket.on(
      "stopTyping",
      ({ senderId, recieverId }) => {
        const user = getUser(recieverId);
        if (user) {
          io.to(user.socketId).emit("userStopTyping", { senderId });
        }
      }
    );

    socket.on("joinGroup", (data) => {
      try {
        const { group_id, userId } = data;
        socket.join(group_id);
        console.log("Connected to the group", group_id, "by user", userId);
        socket
          .to(group_id)
          .emit("joinGroupResponse", {
            message: "Successfully joined the group",
          });
      } catch (error) {
        console.error("Error occurred while joining group:", error);
      }
    });

    socket.on("GroupMessage", async (data) => {
      const { group_id, sender_id, content, messageType, file, lastUpdate } = data;
      const datas = {
        group_id,
        sender_id,
        content,
        messageType,
        file,
        lastUpdate,
      };
      if (group_id) {
        const emitData = {
          group_id,
          sender_id,
          content,
          messageType,
          file
        };
        io.to(group_id).emit("responseGroupMessage", emitData);
      }
    });
    socket.on("videoCallRequest", (data) => {
      const emitdata = {
        roomId: data.roomId,
        senderName: data.senderName,
        senderProfile: data.senderProfile
      };
      console.log(emitdata)
      const user = getUser(data.recieverId);
      if (user) {
        io.to(user.socketId).emit("videoCallResponse", emitdata);
      }
    });


    //Group Video Call 

    socket.on("GroupVideoCallRequest", (data) => {

      const emitdata = {
        roomId: data.roomId,
        groupName: data.groupName,
        groupProfile: data.groupProfile
      }

      io.to(data.groupId).emit("GroupVideoCallResponse", emitdata)
    })


    // When disconnectec
    socket.on("disconnect", () => {
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};

module.exports = socketIo_Config;
