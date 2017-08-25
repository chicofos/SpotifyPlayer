
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi();

module.exports = function(app, session){

  
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
    var access_token = req.body.access_token;
    var refresh_token = req.body.refresh_token;
    var token = null;

    if(refresh_token == "undefined"){
      if(access_token == null)
          res.end(JSON.stringify({ access_token: null, message: 'token undefined' }));
      else
          token = access_token
    }
    else
      token = refresh_token;

    spotifyApi.setAccessToken(token);
    session.token = token;
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