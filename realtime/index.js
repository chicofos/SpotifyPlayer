const socketio = require('socket.io');
var SpotifyWebApi = require('spotify-web-api-js');

var spotifyApi = new SpotifyWebApi();

module.exports = function(server){

  var io = socketio(server);

  io.on('connection', function (socket) {
    
    socket.emit('init');
    
    socket.on('setToken', function(data){
      if(data.token != "")
        spotifyApi.setAccessToken(data.token);
    });


  });


};