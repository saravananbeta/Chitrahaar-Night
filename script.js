
    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('clockDisplay').innerText = `${hours}:${minutes}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    

    function shufflePlaylist(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    // Separate copies so shuffling doesn't mutate original
    const shuffledList = [...originalPlaylist];
    shufflePlaylist(shuffledList);

    let isShuffleOn = false;    
    let currentIndex = 0;    
    let ytPlayer;
    let isAudioMuted = true;
	// let shouldPauseAfterLoad = true;

    function getActivePlaylist() {
      return isShuffleOn ? shuffledList : originalPlaylist;
    }

    function onYouTubeIframeAPIReady() {
      const activeList = getActivePlaylist();
      ytPlayer = new YT.Player('player', {
        height: '1',
        width: '1',
        videoId: activeList[currentIndex],
        playerVars: { 
          'autoplay': 1,
          'mute': 1,
          'controls': 0,
          'playsinline': 1
        },
        events: {
          'onReady': function(event) {
            event.target.mute();
            event.target.setVolume(50);
            updateMuteUI();
            updateUI();
          },
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
    }    

    document.addEventListener('click', function unmuteOnFirstClick(e) {
      if (e.target.closest('#muteBtn')) return;
      if (isAudioMuted) {
        isAudioMuted = false;
        if (ytPlayer && typeof ytPlayer.unMute === 'function') {
          ytPlayer.unMute();
          ytPlayer.setVolume(100);
        }
        updateMuteUI();
      }
    }, { once: true });

    document.addEventListener('DOMContentLoaded', function() {
      const muteBtn = document.getElementById('muteBtn');
      if (muteBtn) {
        muteBtn.addEventListener('click', function() {
          isAudioMuted = !isAudioMuted;
          if (ytPlayer && typeof ytPlayer.unMute === 'function') {
            if (isAudioMuted) {
              ytPlayer.mute();
            } else {
              ytPlayer.unMute();
              ytPlayer.setVolume(100);
            }
          }
          updateMuteUI();
        });
      }
    });

    function updateMuteUI() {
      const muteIcon = document.getElementById('muteIcon');
      const muteBtn = document.getElementById('muteBtn');
      if (!muteIcon) return;

      if (isAudioMuted) {
        muteIcon.textContent = '🔇';
        if (muteBtn) muteBtn.classList.add('is-muted');
      } else {
        muteIcon.textContent = '🔊';
        if (muteBtn) muteBtn.classList.remove('is-muted');
      }
    }

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    }
    
    function updateUI() {
      const activeList = getActivePlaylist();
      const id = activeList[currentIndex];
      document.getElementById('trackThumb').src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      fetchTrackTitle();
    }

   /* function fetchTrackTitle() {
      if (ytPlayer && ytPlayer.getVideoData) {
        const title = ytPlayer.getVideoData().title;
        if (title) {
          document.getElementById('trackTitle').innerText = title;
          document.getElementById('trackTitle').title = title;
          return;
        }
      }
      document.getElementById('trackTitle').innerText = `Track ${currentIndex + 1}`;
    }  */

 /*  function fetchTrackTitle(attempts = 0) {
  if (ytPlayer && typeof ytPlayer.getVideoData === 'function') {
    const title = ytPlayer.getVideoData().title;
    if (title && title.trim() !== '') {
      document.getElementById('trackTitle').innerText = title;
      document.getElementById('trackTitle').title = title;
      return;
    }
  }
  
  // Retry up to 10 times (2 seconds total) while YouTube loads metadata
  if (attempts < 10) {
    setTimeout(() => fetchTrackTitle(attempts + 1), 200);
  } else {
    document.getElementById('trackTitle').innerText = `Track ${currentIndex + 1}`;
    document.getElementById('trackTitle').title = `Track ${currentIndex + 1}`;
  }
}  */

  function fetchTrackTitle() {
  const activeList = getActivePlaylist();
  const videoId = activeList[currentIndex];

  // Instantly set fallback text while fetching
 // document.getElementById('trackTitle').innerText = `Loading Track ${currentIndex + 1}...`;

  /* fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${videoId}`)
    .then(response => response.json())
    .then(data => {
      if (data.title) {
        document.getElementById('trackTitle').innerText = data.title;
        document.getElementById('trackTitle').title = data.title;
      } else {
        document.getElementById('trackTitle').innerText = `Track ${currentIndex + 1}`;
      }
    })
    .catch(() => {
      document.getElementById('trackTitle').innerText = `Track ${currentIndex + 1}`;
    });
}  */
   // New code from Gemini
   fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(data => {
    const title = data.title || `Track ${currentIndex + 1}`;
    document.getElementById('trackTitle').innerText = title;
    document.getElementById('trackTitle').title = title;
  })
  .catch(() => {
    document.getElementById('trackTitle').innerText = `Track ${currentIndex + 1}`;
  });
}	  

    function jumpToTrack(val) {
      let num = parseInt(val, 10);
      if (isNaN(num)) return;

      const activeList = getActivePlaylist();
      if (num < 1) num = 1;
      if (num > activeList.length) num = activeList.length;

      currentIndex = num - 1;
      renderTrackChange();
    }

    function togglePlay() {
	 if (!ytPlayer) return;

    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.blur(); // Prevents sticky yellow focus on mobile after tapping	
      if (!ytPlayer) return;
      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    }

    function toggleShuffle() {
      isShuffleOn = !isShuffleOn;
      const btn = document.getElementById('shuffleBtn');
      if (btn) {
        btn.classList.toggle('is-active', isShuffleOn);
       btn.blur(); // Prevents sticky browser focus styling
      }
     getNumbers(); // for updating shuffle/straight symbols near track number. 
    }

    function flashButton(btn) {
      if (!btn || !(btn instanceof HTMLElement)) return;
      if (btn._timer) clearTimeout(btn._timer);
      btn.classList.add('is-pressed');
      btn._timer = setTimeout(function() {
        btn.classList.remove('is-pressed');
        btn.blur();
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }, 1000);
    }

    function nextTrack(e) {
      if (e && e.preventDefault) e.preventDefault();
      const btn = e ? (e.currentTarget || e.target) : null;
      flashButton(btn);

      const activeList = getActivePlaylist();
      currentIndex = (currentIndex + 1) % activeList.length;
      renderTrackChange();
	  if (!ytPlayer) return; ytPlayer.pauseVideo();	
	  getNumbers();
	  setTimeout(() => ytPlayer.playVideo(), 1500);
    }

    function prevTrack(e) {
      if (e && e.preventDefault) e.preventDefault();
      const btn = e ? (e.currentTarget || e.target) : null;
      flashButton(btn);

      const activeList = getActivePlaylist();
      currentIndex = (currentIndex - 1 + activeList.length) % activeList.length;
      renderTrackChange();
	  if (!ytPlayer) return; ytPlayer.pauseVideo();
	  getNumbers();
	  setTimeout(() => ytPlayer.playVideo(), 1500);
    }

    /* function renderTrackChange() {
      const activeList = getActivePlaylist();
      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById(activeList[currentIndex]);
        updateUI();
      }
    } */

/* function renderTrackChange() {
  const activeList = getActivePlaylist();

  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    // Only check if it was explicitly PAUSED by the user before changing tracks
    const wasPaused = (ytPlayer.getPlayerState && ytPlayer.getPlayerState() === YT.PlayerState.PAUSED);

    ytPlayer.loadVideoById(activeList[currentIndex]);

    if (wasPaused) {
      setTimeout(() => {
        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
          ytPlayer.pauseVideo();
          
          const btn = document.getElementById('playBtn');
          if (btn) {
            btn.innerText = '▶';
            btn.classList.add('is-paused');
          }
          const thumb = document.getElementById('trackThumb');
          if (thumb) {
            thumb.classList.remove('is-playing');
          }
        }
      }, 50);
    }
    updateUI();
  }
} */
   /* function renderTrackChange() {
  const activeList = getActivePlaylist();

  if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
    // Check if player is paused OR if a pause is already queued from a previous rapid click
    const state = ytPlayer.getPlayerState ? ytPlayer.getPlayerState() : null;
    if (state === YT.PlayerState.PAUSED || shouldPauseAfterLoad) {
      shouldPauseAfterLoad = true;
    }

    ytPlayer.loadVideoById(activeList[currentIndex]);
    updateUI();
  }
} */
/*  Copied from Ceylone player */
function renderTrackChange() {
  const activeList = getActivePlaylist();	
  const id = activeList[currentIndex];
  const thumb = document.getElementById('trackThumb');

      if (thumb) {
        thumb.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      }

      if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById(id);
      }
      fetchTrackTitle();
}
	  
    document.addEventListener('DOMContentLoaded', function() {
      const buttons = document.querySelectorAll('.controls button');
      buttons.forEach(function(btn) {
        btn.addEventListener('touchend', function() {
          setTimeout(() => btn.blur(), 50);
        });
      });
    });  

	

    function setVolume(val) {
      if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(val);
      }
    }

    function playNextOrRandom() {
      const activeList = getActivePlaylist();
      currentIndex = (currentIndex + 1) % activeList.length;
      renderTrackChange();
    } 

   /* function onPlayerStateChange(event) {
      const btn = document.getElementById('playBtn');

      if (initialLoad && event.data === YT.PlayerState.PLAYING) {
        initialLoad = false;
        event.target.pauseVideo();
        event.target.unMute();
        event.target.setVolume(100);
        isAudioMuted = false;
        btn.innerText = '▶';
        btn.classList.add('is-paused');
        updateMuteUI();
        updateUI();
        return;
      }

      if (event.data === YT.PlayerState.PLAYING) {
        btn.innerText = '⏸';
        btn.classList.remove('is-paused');
        document.getElementById('trackThumb').classList.add('is-playing');
        fetchTrackTitle();
      } else if (event.data === YT.PlayerState.PAUSED) {
        btn.innerText = '▶';
        btn.classList.add('is-paused');
        document.getElementById('trackThumb').classList.remove('is-playing');
      } else if (event.data === YT.PlayerState.ENDED) {
        playNextOrRandom();
        document.getElementById('trackThumb').classList.remove('is-playing');
      }
      getNumbers();
    }   */

	// Pasting from Ceylon player
let initialLoad = true;
function onPlayerStateChange(event) {
  const btn = document.getElementById('playBtn');

  if (initialLoad && event.data === YT.PlayerState.PLAYING) {
    initialLoad = false;

    event.target.pauseVideo();
    event.target.unMute();
    event.target.setVolume(100);

    isAudioMuted = false;

    btn.innerText = '▶';
    btn.classList.add('is-paused');

    updateMuteUI();
    updateUI(event);

    return;
  }

  if (event.data === YT.PlayerState.PLAYING) {
    btn.innerText = '⏸';
    btn.classList.remove('is-paused');
    document.getElementById('trackThumb').classList.add('is-playing');
    fetchTrackTitle();

  } else if (event.data === YT.PlayerState.PAUSED) {
    btn.innerText = '▶';
    btn.classList.add('is-paused');
    document.getElementById('trackThumb').classList.remove('is-playing');

  } else if (event.data === YT.PlayerState.ENDED) {
    document.getElementById('trackThumb').classList.remove('is-playing');
    advanceToNextTrack(); "i was here";
  }
  getNumbers();
}   
  function advanceToNextTrack() {
	const activeList = getActivePlaylist();  
	currentIndex = (currentIndex + 1) % activeList.length;
    renderTrackChange();
  }
    function onPlayerError(event) {
      console.warn(`Track ${currentIndex + 1} is unplayable. Skipping...`);
      playNextOrRandom();
    }
    
    let currentCount = Math.floor(Math.random() * (25 - 10 + 1)) + 10;

    function updateFakeListeners() {
      const countElem = document.getElementById('listenerCount');
      if (countElem) {
        countElem.innerText = `Online: ${currentCount}`;
        const delta = Math.floor(Math.random() * 5) - 2;
        currentCount = Math.max(5, currentCount + delta);
      }
    }
    updateFakeListeners();
    setInterval(updateFakeListeners, 15000);

    /* Sleep Timer Logic */
    let sleepInterval = null;
    let timeRemaining = 0;

    function toggleSleepMenu() {
      const menu = document.getElementById('sleepMenu');
      menu.classList.toggle('is-open');
    }

    function setTimer(mins) {
      const btn = document.getElementById('sleepBtn');
      document.getElementById('sleepMenu').classList.remove('is-open');

      if (sleepInterval) clearInterval(sleepInterval);

      if (mins === 0) {
        timeRemaining = 0;
        btn.innerText = '🌙 Sleep timer';
        return;
      }

      timeRemaining = mins * 60;
      updateTimerDisplay();

      sleepInterval = setInterval(() => {
        timeRemaining--;

        if (timeRemaining <= 0) {
          clearInterval(sleepInterval);
          if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
            ytPlayer.pauseVideo();
          }
          btn.innerText = '🌙 Sleep timer';
        } else {
          updateTimerDisplay();
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const btn = document.getElementById('sleepBtn');
      const m = Math.floor(timeRemaining / 60);
      const s = String(timeRemaining % 60).padStart(2, '0');
      btn.innerText = `⏳ ${m}:${s} left`;
    }

    document.addEventListener('click', function(e) {
      const container = document.querySelector('.timer-container');
      if (container && !container.contains(e.target)) {
        document.getElementById('sleepMenu').classList.remove('is-open');
      }
    });    

   function getNumbers(){
document.getElementById('trackNumber').innerText = `${currentIndex + 1} / `; 
if (isShuffleOn){ 
document.getElementById('trackTotal').innerText = `${originalPlaylist.length} \u{1F500}`; 
}
else{
document.getElementById('trackTotal').innerText = `${originalPlaylist.length} \u{27A1}`; 
}
}
