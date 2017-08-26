
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

module.exports = function(app){

  
  app.get('/', onRequest);
  app.get('/callback', callback);
  app.get('*', notFound);

  app.get('/token', getToken);
  app.post('/token', setToken);

  function getToken(req,res){
    var token = spotifyApi.getAccessToken();
    res.end(JSON.stringify({ access_token: token }));
  }

 function setToken(req,res){
    var token = req.body.refresh_token;

    if(token == "undefined") 
      res.end(JSON.stringify({ access_token: null, message: 'token undefined' }));

    spotifyApi.setAccessToken(token);
    res.end(JSON.stringify({ access_token: token, message: 'token saved' }));
  }

  function notFound(req,res){
    res.render('notfound');
  }
  
  function callback(req,res){
      res.render('callback');
  }

  function onRequest(req, res){
    var token = spotifyApi.getAccessToken();
    
    res.render('index',{
      title: 'Index',
      token : token
    });
  }


}