const socketio = require('socket.io');
var nodeSpotifyWebHelper = require('node-spotify-webhelper');
var spotify = new nodeSpotifyWebHelper.SpotifyWebHelper();

module.exports = function(server){

  var io = socketio(server);

  io.on('connection', function (socket) {
    
    socket.emit('init');
    
    socket.on('setToken', function(data){
      console.log(data)
    });

  });


};