document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('warning').style.display = 'none';
  document.getElementById('container').style.display = 'grid';

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const container = document.getElementById('container');
      const smoothingFactor = 0.9;

      // Create tiles
      const rows = Math.ceil(window.innerHeight / 25); // Adjusted for smaller tiles
      const cols = Math.ceil(window.innerWidth / 25);  // Adjusted for smaller tiles
      for (let i = 0; i < rows * cols; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        container.appendChild(tile);
      }

      const tiles = document.querySelectorAll('.tile');

      function getAverageVolume(array) {
        let values = 0;
        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += array[i];
        }
        return values / length;
      }

      function getRandomBrightColor() {
        const r = Math.floor(Math.random() * 128) + 128; // 128 to 255
        const g = Math.floor(Math.random() * 64);        // 0 to 63 (less green)
        const b = Math.floor(Math.random() * 128) + 128; // 128 to 255
        return `rgb(${r}, ${g}, ${b})`;
      }

      function changeColorAndAnimateBasedOnSound() {
        analyser.getByteFrequencyData(dataArray);
        const volume = getAverageVolume(dataArray);

        // Increase the threshold to avoid triggering on low-level noise
        if (volume > 50) {
          const color = getRandomBrightColor();

          // Calculate the center of the container
          const centerX = container.clientWidth / 2;
          const centerY = container.clientHeight / 2;

          tiles.forEach((tile, index) => {
            const rect = tile.getBoundingClientRect();
            const tileCenterX = rect.left + rect.width / 2;
            const tileCenterY = rect.top + rect.height / 2;

            const distance = Math.sqrt(Math.pow(tileCenterX - centerX, 2) + Math.pow(tileCenterY - centerY, 2));

            const delay = distance / 100; // Adjust the divisor for different ripple speeds

            setTimeout(() => {
              tile.style.backgroundColor = color;

              // Randomly choose between horizontal and vertical flip
              if (Math.random() > 0.5) {
                tile.classList.add('flip-horizontal');
              } else {
                tile.classList.add('flip-vertical');
              }

              tile.addEventListener('animationend', () => {
                tile.classList.remove('flip-horizontal', 'flip-vertical');
              });
            }, delay);
          });
        }

        requestAnimationFrame(changeColorAndAnimateBasedOnSound);
      }

      changeColorAndAnimateBasedOnSound();
    })
    .catch(err => {
      console.error('Error accessing the microphone', err);
    });
});
