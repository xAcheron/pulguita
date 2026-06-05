document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos del DOM ---
  const introScreen = document.getElementById('intro-screen');
  const mainContent = document.getElementById('main-content');
  const btnStart = document.getElementById('btn-start');
  
  const bgMusic = document.getElementById('bg-music');
  const btnMusic = document.getElementById('btn-music');
  
  const envelope = document.getElementById('envelope');
  
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const happyModal = document.getElementById('happy-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  // --- 1. Navegación / Inicio ---
  btnStart.addEventListener('click', () => {
    // Transición de salida de la pantalla de bienvenida
    introScreen.style.opacity = '0';
    setTimeout(() => {
      introScreen.classList.add('hidden');
      mainContent.classList.remove('hidden');
      mainContent.style.opacity = '0';
      // Fade-in suave del contenido principal
      setTimeout(() => {
        mainContent.style.opacity = '1';
      }, 50);
      
      // Intentar reproducir música automáticamente tras la interacción del usuario
      playMusic();
    }, 800);
  });

  // --- 2. Reproductor de Música ---
  let isPlaying = false;

  function playMusic() {
    bgMusic.play().then(() => {
      isPlaying = true;
      btnMusic.textContent = 'Pause';
    }).catch(err => {
      console.log("El navegador bloqueó la reproducción automática inicial:", err);
    });
  }

  btnMusic.addEventListener('click', () => {
    if (isPlaying) {
      bgMusic.pause();
      btnMusic.textContent = 'Play';
    } else {
      bgMusic.play();
      btnMusic.textContent = 'Pause';
    }
    isPlaying = !isPlaying;
  });

  // --- 3. Sistema de Partículas de Corazón (Canvas) ---
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas.getContext('2d');

  let particles = [];
  const maxParticles = 40;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class HeartParticle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Empezar en puntos aleatorios en el primer render
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.size = Math.random() * 15 + 10;
      this.speedY = Math.random() * 1.5 + 0.5;
      this.speedX = Math.sin(Math.random() * 2) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.growth = Math.random() * 0.01 + 0.005;
      this.angle = Math.random() * 360;
      this.rotationSpeed = Math.random() * 0.5 - 0.25;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y / 30) * 0.3;
      this.angle += this.rotationSpeed;

      // Desvanecer cuando se acerca al borde superior
      if (this.y < 100) {
        this.opacity -= 0.005;
      }

      if (this.y < -20 || this.opacity <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      
      // Dibujar corazón mediante curvas de Bézier
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
      ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
      
      // Color degradado rosa romántico
      const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, this.size);
      gradient.addColorStop(0, '#ff9a9e');
      gradient.addColorStop(1, '#ff758c');
      ctx.fillStyle = gradient;
      
      ctx.fill();
      ctx.restore();
    }
  }

  // Inicializar partículas
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new HeartParticle());
  }

  // Bucle de animación del Canvas
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();

  // --- 4. Interacción del Sobre/Carta ---
  envelope.addEventListener('click', () => {
    envelope.classList.toggle('open');
  });

  // --- 5. Botón Evasivo ("No") ---
  function moveNoButton() {
    const container = btnNo.parentElement;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Cambiar la posición del botón a absoluta para permitir el movimiento
    btnNo.style.position = 'absolute';
    
    // Calcular rangos máximos y mínimos relativos al contenedor
    const maxX = containerRect.width - btnRect.width;
    const maxY = containerRect.height - btnRect.height;

    // Generar nuevas posiciones aleatorias
    let newX = Math.random() * maxX;
    let newY = Math.random() * maxY;

    // Asegurarse de que no aparezca exactamente en la misma posición previa
    if (Math.abs(newX - parseFloat(btnNo.style.left || 0)) < 40) {
      newX = (newX + 80) % maxX;
    }
    if (Math.abs(newY - parseFloat(btnNo.style.top || 0)) < 40) {
      newY = (newY + 80) % maxY;
    }

    btnNo.style.left = `${newX}px`;
    btnNo.style.top = `${newY}px`;
  }

  // Activar movimiento al pasar el cursor o al tocar en móvil
  btnNo.addEventListener('mouseenter', moveNoButton);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Evitar clics fantasmas en móviles
    moveNoButton();
  });

  // --- 6. Acción del Botón "Sí" (Modal y Confeti) ---
  btnYes.addEventListener('click', () => {
    happyModal.classList.remove('hidden');
    happyModal.style.opacity = '1';
    
    // Lanzar efecto confeti de corazones
    launchConfetti();
  });

  btnCloseModal.addEventListener('click', () => {
    happyModal.style.opacity = '0';
    setTimeout(() => {
      happyModal.classList.add('hidden');
    }, 500);
  });

  // --- 7. Efecto de Confeti de Corazones ---
  function launchConfetti() {
    const confettiCount = 100;
    const confettiColors = ['#ff758c', '#ff7eb3', '#ffecd2', '#ff6b8b', '#ffffff'];
    
    for (let i = 0; i < confettiCount; i++) {
      const confettiEl = document.createElement('div');
      confettiEl.classList.add('confetti-particle');
      
      // Estilos CSS dinámicos e inline para cada partícula de confeti
      const size = Math.random() * 12 + 6;
      confettiEl.style.width = `${size}px`;
      confettiEl.style.height = `${size}px`;
      confettiEl.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      confettiEl.style.borderRadius = '50%';
      confettiEl.style.position = 'fixed';
      confettiEl.style.left = '50%';
      confettiEl.style.bottom = '50%';
      confettiEl.style.zIndex = '250';
      confettiEl.style.pointerEvents = 'none';
      
      // Decidir forma (corazón o círculo)
      if (Math.random() > 0.5) {
        confettiEl.style.clipPath = 'path("M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z")';
        confettiEl.style.width = '24px';
        confettiEl.style.height = '24px';
      }

      document.body.appendChild(confettiEl);

      // Calcular dirección de explosión aleatoria
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 15 + 5;
      const velocityX = Math.cos(angle) * velocity;
      const velocityY = Math.sin(angle) * velocity;
      
      let curX = window.innerWidth / 2;
      let curY = window.innerHeight / 2;
      let gravity = 0.3;
      let opacity = 1;

      // Animación manual mediante requestAnimationFrame para máximo control y rendimiento
      function animConfetti() {
        curX += velocityX;
        curY += velocityY + gravity;
        gravity += 0.05;
        opacity -= 0.015;

        confettiEl.style.left = `${curX}px`;
        confettiEl.style.top = `${curY}px`;
        confettiEl.style.opacity = opacity;

        if (opacity > 0) {
          requestAnimationFrame(animConfetti);
        } else {
          confettiEl.remove();
        }
      }
      requestAnimationFrame(animConfetti);
    }
  }
});
