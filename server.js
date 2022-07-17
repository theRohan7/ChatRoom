const express = require("express")
const path = require('path')
const http = require("http")
const socketio = require('socket.io')
const messageFormat = require('./utils/messages')
const {currentUser , userJoin , userLeaves , roomUsers} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server)


app.use(express.static(path.join(__dirname, 'public')))

// socket

io.on('connection', (socket) => {
    console.log('new socket connection...')


//presenting the users name
socket.on('joinRoom',({username , room})=>{ 
    const user =userJoin(socket.id,username , room)
    
    socket.join(user.room);
    
    
    
    const botName ="chatroom"
    
      //welcome user
    
      socket.emit('message', messageFormat(botName , 'welcome to chat room'));
    
    
    
      //on connect
    
      socket.broadcast.to(user.room).emit('message',  messageFormat(botName,`${user.username} has joined the chat room` ));
 
 
      //----------------------//-------------------------------------//------------------------------------
      
   
 //sidebar( user and room info.)
      
      io.to(user.room).emit('roomUsers',{
          room: user.room,
          users: roomUsers(user.room)
      })


})






//getting msg server  
socket.on('chatMessage', (msg)=>{
    const user = currentUser(socket.id);
    
    io.to(user.room).emit('message',  messageFormat(user.username, msg));
})



const botName ="chatroom"
//on disconnect 
 
socket.on('disconnect',()=>{
    const user= userLeaves (socket.id);
    if(user){
    
        io.to(user.room).emit('message', messageFormat(botName,`${user.username} has left the room`));

         //sidebar( user and room info.)
      
      io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: roomUsers(user.room)
    })

    }
})
  
});


const PORT = 3000 || process.env.PORT ;

server.listen(PORT, () => console.log("server running on posrt 3000"));