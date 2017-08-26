$(document).ready(function(){

    var mainContainer = document.getElementById('js-main-container'),
    loginContainer = document.getElementById('js-login-container'),
    loginButton = document.getElementById('js-btn-login'),
    background = document.getElementById('js-background');
    forwardBtn = document.getElementById('forward');
    backwardBtn = document.getElementById('backward');
    playBtn = document.getElementById('play');
    pauseBtn = document.getElementById('pause');
    controls = document.getElementsByClassName('controls')[0];
  
  var spotifyPlayer = new SpotifyPlayer();
  
  var template = function (data) {

    spotifyPlayer.device_id = data.device.id;
    controls.style.display = 'block';

    return `
      <div class="main-wrapper">
        <div class="now-playing__img">
          <img src="${data.item.album.images[0].url}">
        </div>
        <div class="now-playing__side">
          <div class="now-playing__name">${data.item.name}</div>
          <div class="now-playing__artist">${data.item.artists[0].name}</div>
          <div class="now-playing__status">${data.is_playing ? 'Playing' : 'Paused'}</div>
          <div class="progress">
            <div class="progress__bar" style="width:${data.progress_ms * 100 / data.item.duration_ms}%"></div>
          </div>
        </div>
      </div>
      <div class="data-player">
        <div><strong>Device:</strong> ${data.device.id} </div>
        <div><strong>Name:</strong>${data.device.name} </div>
        <div><strong>Volume:</strong>${data.device.volume_percent} </div>
      </div>
    `;
  };
  
  spotifyPlayer.on('update', response => {
    mainContainer.innerHTML = template(response);
  });
  
  spotifyPlayer.on('login', user => {
    if (user === null) {
      loginContainer.style.display = 'block';
      mainContainer.style.display = 'none';
    } else {
      loginContainer.style.display = 'none';
      mainContainer.style.display = 'block';
    }
  });
  

 forwardBtn.addEventListener('click', () => {
    spotifyPlayer.nextSong();
  });

  backwardBtn.addEventListener('click', () => {
    spotifyPlayer.previousSong();
  });

  playBtn.addEventListener('click', () => {
    spotifyPlayer.playSong();
  });

  pauseBtn.addEventListener('click', () => {
    spotifyPlayer.pauseSong();
  });

  loginButton.addEventListener('click', () => {
      spotifyPlayer.login();
  });
  
  var token = document.getElementById("token-reusable").value;
  spotifyPlayer.init(token);

});