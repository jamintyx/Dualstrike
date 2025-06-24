<script>
  // Smooth scroll to #play section
  document.querySelector('.play-button').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('#play').scrollIntoView({ behavior: 'smooth' });
  });

  // Fullscreen toggle
  const gameBox = document.querySelector('.game-box');
  gameBox.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
      gameBox.requestFullscreen().catch(err => alert(`Error trying to enable fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen();
    }
  });

  // Keyboard shortcut: Press "F" to toggle fullscreen
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'f') {
      if (!document.fullscreenElement) {
        gameBox.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
      } else {
        document.exitFullscreen();
      }
    }
  });
</script>
