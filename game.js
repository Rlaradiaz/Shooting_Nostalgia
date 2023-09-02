let jugador;
let enemigos = [];
let balas = [];
let marcianoImages = [];
let helicopterImages = [];
let helicopter1Images = [];
let bossImages = [];
let explosionImages = [];
let fondoImages = [];
let fondoY = [0, -600, -1200, -1800];
let fondoSpeed = 1;
let puntaje = 0;
let vida = 100;
let sonidoDisparo;
let sonidoExplosion;
let juegoEnPausa = false;
let tiempoUltimoEnemigo = 0;
let tiempoGenerarEnemigo = 1000; // Intervalo de tiempo para generar enemigos en milisegundos
let musicaFondo; // Declarar la variable para la música de fondo

function preload() {
  // Cargar imágenes
  for (let i = 1; i <= 15; i++) {
    marcianoImages.push(loadImage(`Shooting_Nostalgia/marciano/${i}.png`));
  }
  for (let i = 1; i <= 8; i++) {
    helicopterImages.push(loadImage(`Shooting_Nostalgia/helicoptero/${i}.png`));
    helicopter1Images.push(loadImage(`Shooting_Nostalgia/helicoptero1/${i}.png`));
  }
  for (let i = 1; i <= 7; i++) {
    bossImages.push(loadImage(`Shooting_Nostalgia/Boss/${i}.png`));
  }
  for (let i = 1; i <= 12; i++) {
    explosionImages.push(loadImage(`Shooting_Nostalgia/explosion/${i}.png`));
  }
  for (let i = 1; i <= 4; i++) {
    fondoImages.push(loadImage(`Shooting_Nostalgia/imagenes/juego${i}.jpg`));
  }

  // Cargar sonidos
  sonidoDisparo = loadSound('Shooting_Nostalgia/sounds/laser.wav');
  sonidoExplosion = loadSound('Shooting_Nostalgia/sounds/explosion.wav');
  musicaFondo = loadSound('Shooting_Nostalgia/mega.mp3');
}

function setup() {
  // Crear el lienzo y ubicarlo en el centro
  let canvasWidth = fondoImages[0].width;
  let canvasHeight = fondoImages[0].height;
  let canvas = createCanvas(canvasWidth, canvasHeight);
  let canvasX = (windowWidth - canvasWidth) / 2;
  let canvasY = (windowHeight - canvasHeight) / 2;
  canvas.position(canvasX, canvasY);

  // Crear el jugador centrado horizontalmente
  jugador = new Jugador(canvasWidth / 2, canvasHeight - 50);
  musicaFondo.loop(); // Iniciar la música de fondo
}

function draw() {
  // Actualizar y mostrar el fondo
  for (let i = 0; i < fondoImages.length; i++) {
    image(fondoImages[i], 0, fondoY[i]);
    fondoY[i] += fondoSpeed;
    if (fondoY[i] > height) {
      fondoY[i] = -fondoImages[i].height;
    }
  }

  // Actualizar y mostrar al jugador
  jugador.update();
  jugador.show();

  // Generar enemigos en intervalos de tiempo
  if (millis() - tiempoUltimoEnemigo > tiempoGenerarEnemigo) {
    generarEnemigo();
    tiempoUltimoEnemigo = millis();
  }

  // Actualizar y mostrar las balas
  for (let i = balas.length - 1; i >= 0; i--) {
    let bala = balas[i];
    bala.update();
    bala.show();

    // Verificar colisiones de balas con enemigos
    for (let j = enemigos.length - 1; j >= 0; j--) {
      if (bala.hits(enemigos[j])) {
        enemigos[j].recibirDano(10);
        balas.splice(i, 1);

        // Reproducir el sonido de explosión
        sonidoExplosion.play();

        if (enemigos[j].estaMuerto()) {
          puntaje += enemigos[j].puntos;
          enemigos.splice(j, 1);
        }
        break;
      }
    }
  }

  // Actualizar y mostrar enemigos
  for (let enemigo of enemigos) {
    enemigo.update();
    enemigo.show();

    // Verificar colisiones de enemigos con jugador
    if (enemigo.hits(jugador)) {
      vida -= 10;
      enemigos.splice(enemigos.indexOf(enemigo), 1);
      if (vida <= 0) {
        gameOver();
      }
      break;
    }
  }

  // Mostrar puntaje y vida
  textSize(20);
  fill(255);
  text(`Puntaje: ${puntaje}`, 10, 30);
  text(`Vida: ${vida}%`, 10, 60);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    jugador.setVelocidad(-5, 0);
  } else if (keyCode === RIGHT_ARROW) {
    jugador.setVelocidad(5, 0);
  } else if (keyCode === UP_ARROW) {
    jugador.setVelocidad(0, -5);
  } else if (keyCode === DOWN_ARROW) {
    jugador.setVelocidad(0, 5);
  } else if (key === ' ' && !juegoEnPausa) {
    balas.push(new Bala(jugador.x + jugador.ancho / 2, jugador.y));

    // Reproducir el sonido de disparo
    sonidoDisparo.play(); // Quita el punto y coma de aquí
  } else if (key === 'p') {
    juegoEnPausa = !juegoEnPausa;
    if (juegoEnPausa) {
      noLoop();
    } else {
      loop();
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    jugador.setVelocidad(0, 0);
  } else if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    jugador.setVelocidad(0, 0);
  }
}

function gameOver() {
  background(0);
  textSize(50);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);
  noLoop();
}

class Jugador {
  constructor(x, y) {
    this.imagen = loadImage("Shooting_Nostalgia/Resized_Nave.png");
    this.ancho = 100;
    this.alto = 100;
    this.x = x;
    this.y = y;
    this.velX = 0;
    this.velY = 0;
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;

    this.x = constrain(this.x, 0, width - this.ancho);
    this.y = constrain(this.y, 0, height - this.alto);
  }

  show() {
    image(this.imagen, this.x, this.y, this.ancho, this.alto);
  }

  setVelocidad(x, y) {
    this.velX = x;
    this.velY = y;
  }
}

class Bala {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velY = -10;
    this.ancho = 10;
    this.alto = 20;
  }

  update() {
    this.y += this.velY;
  }

  show() {
    fill(255, 0, 0);
    noStroke();
    rect(this.x, this.y, this.ancho, this.alto);
  }

  hits(enemigo) {
    return (
      this.x > enemigo.x &&
      this.x < enemigo.x + enemigo.ancho &&
      this.y > enemigo.y &&
      this.y < enemigo.y + enemigo.alto
    );
  }
}

class Enemigo {
  constructor(imagenes, x, y, velocidad) {
    this.imagenes = imagenes;
    this.x = x;
    this.y = y;
    this.ancho = 100;
    this.alto = 100;
    this.velocidad = velocidad;
    this.puntos = 10;
    this.frame = 0;
  }

  update() {
    this.y += this.velocidad;
    if (this.y > height) {
      enemigos.splice(enemigos.indexOf(this), 1);
    }
    this.frame = (this.frame + 1) % this.imagenes.length;
  }

  show() {
    image(this.imagenes[this.frame], this.x, this.y, this.ancho, this.alto);
  }

  hits(jugador) {
    return (
      this.x < jugador.x + jugador.ancho &&
      this.x + this.ancho > jugador.x &&
      this.y < jugador.y + jugador.alto &&
      this.y + this.alto > jugador.y
    );
  }

  recibirDano(dano) {
    vida -= dano;
  }

  estaMuerto() {
    return vida <= 0;
  }
}

function generarEnemigo() {
  let x = random(width - 100);
  let y = -100;
  let velocidad = random(1, 5);
  let imagenes;
  let r = random(1);
  if (r < 0.3) {
    imagenes = marcianoImages;
  } else if (r < 0.6) {
    imagenes = helicopterImages;
  } else {
    imagenes = helicopter1Images;
  }
  enemigos.push(new Enemigo(imagenes, x, y, velocidad));
}

// Usar setTimeout en lugar de setInterval
function generarEnemigosPeriodicamente() {
  generarEnemigo();
  setTimeout(generarEnemigosPeriodicamente, tiempoGenerarEnemigo);
}

setTimeout(generarEnemigosPeriodicamente, tiempoGenerarEnemigo);

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
