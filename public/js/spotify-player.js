class SpotifyPlayer {
  constructor(options = {}) {
    this.options = options;
    this.listeners = {};
    this.accessToken = null;
    this.exchangeHost = options.exchangeHost || 'http://localhost:3000';
    this.obtainingToken = false;
    this.loopInterval = null;
    this.device_id = null;
  }

  on(eventType, callback) {
    this.listeners[eventType] = this.listeners[eventType] || [];
    this.listeners[eventType].push(callback);
  }

  dispatch(topic, data) {
    const listeners = this.listeners[topic];
    if (listeners) {
      listeners.forEach(listener => {
        listener.call(null, data);
      });
    }
  }

  init(token) {
    if(token != ""){
      this.accessToken = token;
      this._onNewAccessToken();
    }
    else {
      this.fetchToken().then(r => r.json()).then(json => {
        this.accessToken = json['access_token'];
        this.expiresIn = json['expires_in'];
        this._onNewAccessToken();
      });
  }
}

  fetchToken() {
    this.obtainingToken = true;
    return fetch(`${this.exchangeHost}/token`, {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: localStorage.getItem('refreshToken'),
        access_token: localStorage.getItem('access_token')
      }),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(response => {
      this.obtainingToken = false;
      return response;
    }).catch(e => {
      console.error(e);
    });
  }

  _onNewAccessToken() {
    if (this.accessToken === null) {
      console.log('Got empty access token, log out');
      this.dispatch('login', null);
      this.logout();
    } else {
      const loop = () => {
        if (!this.obtainingToken) {
          this.fetchPlayer()
            .then(data => {
              if (data !== null && data.item !== null) {
                this.dispatch('update', data);
              }
            })
            .catch(e => {
              console.log('Logging user out due to error', e);
              this.logout();
            });
        }
      };
      this.fetchUser().then(user => {
        this.dispatch('login', user);
        this.loopInterval = setInterval(loop.bind(this), 1500);
        loop();
      });
    }
  }

  logout() {
    // clear loop interval
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    this.accessToken = null;
    this.dispatch('login', null);
  }

  login() {
    return new Promise((resolve, reject) => {
      const getLoginURL = scopes => {

        var CLIENT_ID = 'c98fa7f017a847008932e13964ad862f';
        var REDIRECT_URI = 'http://localhost:3000/callback';

        //return `${this.exchangeHost}/login?scope=${encodeURIComponent(scopes.join(' '))}`;
        return `${ 
        'https://accounts.spotify.com/authorize?client_id=' + CLIENT_ID +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
        '&scope=' + encodeURIComponent(scopes.join(' ')) +
        '&response_type=token'
        }`
      };

      const url = getLoginURL(['user-modify-playback-state']);

      const width = 450, height = 730, left = screen.width / 2 - width / 2, top = screen.height / 2 - height / 2;

      window.addEventListener(
        'message',
        event => {
          let hash = null;
          try{
            hash = JSON.parse(event.data);
          }
          catch(e){
            console.log("event is parsed already");
          }
          if(hash != null){
            if (hash.type == 'access_token') {
              this.accessToken = hash.access_token;
              this.expiresIn = hash.expires_in;
              localStorage.setItem('access_token', hash.access_token);
              this._onNewAccessToken();
              if (this.accessToken == null) {
                reject();
              } else {
                const refreshToken = hash.access_token;
                localStorage.setItem('refreshToken', refreshToken);
                resolve(hash.access_token);
              }
            }
          }
        },
        false
      );

      const w = window.open(
        url,
        'Spotify',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' +
          width +
          ', height=' +
          height +
          ', top=' +
          top +
          ', left=' +
          left
      );
    });
  }

  fetchGeneric(url) {
    return fetch(url, {
      headers: { Authorization: 'Bearer ' + this.accessToken }
    });
  }

  fetchWrapper(url, method) {
    let fetchData = { 
      method: method, 
      body: { device_id : this.device_id },
      headers: { 
        Accept: "application/json",
        Authorization: 'Bearer ' + this.accessToken
       }
    }
    return fetch(url, fetchData);
  }

  fetchPlayer() {
    return this.fetchGeneric('https://api.spotify.com/v1/me/player').then(response => {
      if (response.status === 401) {
        return this.fetchToken()
          .then(tokenResponse => {
            if (tokenResponse.status === 200) {
              return tokenResponse.json();
            } else {
              throw 'Could not refresh token';
            }
          })
          .then(json => {
            this.accessToken = json['access_token'];
            this.expiresIn = json['expires_in'];
            return this.fetchPlayer();
          });
      } else if (response.status >= 500) {
        // assume an error on Spotify's site
        console.error('Got error when fetching player', response);
        return null;
      } else {
        return response.json();
      }
    });
  }

  fetchUser() {
    return this.fetchGeneric('https://api.spotify.com/v1/me').then(data => data.json());
  }

  nextSong(){
    return this.fetchWrapper('https://api.spotify.com/v1/me/player/next','POST')
      .then(data => data.json)
  }

  previousSong(){
    return this.fetchWrapper('https://api.spotify.com/v1/me/player/previous','POST')
      .then(data => data.json)
  }

  pauseSong(){
    return this.fetchWrapper('https://api.spotify.com/v1/me/player/pause','PUT')
      .then(data => data.json)
  }

  playSong(){
    return this.fetchWrapper('https://api.spotify.com/v1/me/player/play','PUT')
      .then(data => data.json)
  }

}
