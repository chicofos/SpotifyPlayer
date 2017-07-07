
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

module.exports = function(app, server){

  app.get('/', onRequest);
  app.get('/callback', callback);
  app.get('*', notFound);

  app.post('/token', setToken);

 function setToken(req,res){
    var token = req.body.token;
    spotifyApi.setAccessToken(token);
    res.end(JSON.stringify({ error: null }));
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