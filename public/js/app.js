

$(document).ready(function(){
  
    const token = $("#token").text();
    var socket = io.connect('http://localhost:3000');

    socket.on('init', function (data) {
        socket.emit('setToken', { token: token });
    });

    function login(callback) {
        var CLIENT_ID = 'c98fa7f017a847008932e13964ad862f';
        var REDIRECT_URI = 'http://localhost:3000/callback';
        function getLoginURL(scopes) {
            return 'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
              '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
              '&scope=' + encodeURIComponent(scopes.join(' ')) +
              '&response_type=token';
        }
        
        var url = getLoginURL([
            'user-read-currently-playing',
            'user-read-currently-playing',
            'user-read-playback-state',
        ]);
        
        var width = 450,
            height = 730,
            left = (screen.width / 2) - (width / 2),
            top = (screen.height / 2) - (height / 2);
    
        window.addEventListener("message", function(event) {
            var hash = JSON.parse(event.data);
            if (hash.type == 'access_token') {
                callback(hash.access_token);
            }
        }, false);
        
        var w = window.open(url,'Spotify','menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);  
    }

   var loginButton = document.getElementById('btn-login');
    
    loginButton.addEventListener('click', function() {
        login(function(accessToken) {
            setAccessToken(accessToken).then(function(response){
                $('#btn-login').hide();
                $("#search").show();
            });
        });
    });
    
    function setAccessToken(token){
        return $.ajax({
            url: '/token',
            method: 'POST',
            data: { token : token }
        });
    }



    function showUserInfo(){
        return $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
               'Authorization': 'Bearer ' + token
            }
        });
    }

    function showCurrentSong(){
         return $.ajax({
            url: 'https://api.spotify.com/v1/me/player/currently-playing',
            headers: {
               'Authorization': 'Bearer ' + token
            }
        });
    }



    function isLogged(){
        if(token != ""){
            $("#btn-login").hide();
            $("#search").show();
            
            showUserInfo()
            .then(function(data){
                $("#userId").text(data.id);
            }, function(err){
                if(err.status = 401){
                    $('#btn-login').show();
                    $("#search").hide();
                }
            });

            showCurrentSong()
                .then(function(data){
                    if(data.is_playing){
                        var image = data.item.album.images[0].url
                        var artist = data.item.artists[0].name;
                        var song = data.item.name;
                    }

                    $("#currentSong").append("<div id='current-title'>Current song:</div><div id='image'><img src='"+ image +"' height='80px'></div><span id='artist'>"+artist+"</span><br/>"+"<span id='song'>"+song+"</span>");

                }, function(err){
                    if(err.status = 401){
                        $('#btn-login').show();
                        $("#search").hide();
                    }
                });
            
        }else{
            $("#search").hide();
        }
    }


isLogged();

});