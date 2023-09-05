let jugador;
let enemigos = [];
let balas = [];
let marcianoImages = [];
let helicopterImages = [];
let helicopter1Images = [];
let bossImages = [];
let explosionImages = [];
let fondoImages = [];
let fondoY = 0;
let fondoSpeed = 1;
let puntaje = 0;
let vida = 100;
let sonidoDisparo;
let sonidoExplosion;
let juegoEnPausa = false;
let tiempoUltimoEnemigo = 0;
let tiempoGenerarEnemigo = 2000;
let musicaFondo;
let imagenBienvenida;
let pantallaBienvenida = true;

let fondoActual = 0;
let fondoSiguiente = 1;
let transicion = 0;
//lista
// Nueva lista para enemigos que deben eliminarse
let enemigosPorEliminar = [];

function preload() {
  // Cargar imágenes
  for (let i = 1; i <= 15; i++) {
    marcianoImages.push(loadImage(`marciano/${i}.png`));
  }
  for (let i = 1; i <= 8; i++) {
    helicopterImages.push(loadImage(`helicoptero2/${i}.png`));
    helicopter1Images.push(loadImage(`helicoptero3/${i}.png`));
  }
  for (let i = 1; i <= 7; i++) {
    bossImages.push(loadImage(`Boss/${i}.png`));
  }
  for (let i = 1; i <= 12; i++) {
    explosionImages.push(loadImage(`explosion/${i}.png`));
  }
  for (let i = 1; i <= 4; i++) {
    fondoImages.push(loadImage(`imagenes/juego${i}.jpg`));
  }

  // Cargar sonidos
  sonidoDisparo = loadSound('sounds/laser.wav');
  sonidoExplosion = loadSound('sounds/explosion.wav');
  musicaFondo = loadSound('mega.mp3');
  imagenBienvenida = loadImage('imagenes/cat.jpeg');
}

function setup() {
  // Obtener el tamaño de una de las imágenes de fondo (suponiendo que todas son del mismo tamaño)
  let fondoWidth = fondoImages[0].width;
  let fondoHeight = fondoImages[0].height;

  createCanvas(fondoWidth, fondoHeight);
  jugador = new Jugador(fondoWidth / 2, fondoHeight - 50);
  musicaFondo.loop();
  pantallaBienvenida = true;
}


function draw() {
  if (pantallaBienvenida) {
    // Muestra la imagen de bienvenida
    image(imagenBienvenida, 0, 0, width, height);

    // Agrega un mensaje o cualquier otro elemento que desees
    textSize(32);
    fill(255);
    textAlign(CENTER, CENTER);
    text("Presiona una tecla para comenzar", width / 2, height - 50);
  } else {
   
    // Actualizar y mostrar el fondo
    image(fondoImages[fondoActual], 0, fondoY, width, height);
    image(fondoImages[fondoSiguiente], 0, fondoY - height, width, height);
    fondoY += fondoSpeed;
    if (fondoY >= height) {
      fondoY = 0;
      fondoActual = fondoSiguiente;
      fondoSiguiente = (fondoSiguiente + 1) % fondoImages.length;
    }

    // Actualizar y mostrar al jugador
    jugador.update();
    jugador.show();

    // Generar enemigos en intervalos de tiempo
    if (millis() - tiempoUltimoEnemigo > tiempoGenerarEnemigo) {
      if (random(1) < 0.5) {
        generarEnemigos1();
      } else {
        generarEnemigos2();
      }
      tiempoUltimoEnemigo = millis();
    }

    for (let i = balas.length - 1; i >= 0; i--) {
      let bala = balas[i];
      bala.update();
      bala.show();

      for (let j = enemigos.length - 1; j >= 0; j--) {
        if (bala.hits(enemigos[j])) {
          balas.splice(i, 1);

          if (enemigos[j].recibirDano(10)) {
            enemigos[j].activarExplosion();
            puntaje += enemigos[j].puntos;
          }
          break;
        }
      }
    }

    // Actualizar y mostrar enemigos
    for (let i = enemigos.length - 1; i >= 0; i--) {
      let enemigo = enemigos[i];
      enemigo.update();
      
      if (enemigo.estaMuerto() && !enemigo.estaExplotando()) {
        // Agregar el enemigo a la lista de enemigos para eliminar
        enemigosPorEliminar.push(i);
      } else {
        enemigo.show();
      }

      if (enemigo.hits(jugador)) {
        vida -= 10;
        if (vida <= 0) {
          gameOver();
        }
        break;
      }
    }

    // Eliminar enemigos que deben eliminarse
    for (let i = enemigosPorEliminar.length - 1; i >= 0; i--) {
      let index = enemigosPorEliminar[i];
      enemigos.splice(index, 1);
    }
    // Limpiar la lista de enemigos para eliminar
    enemigosPorEliminar = [];

    // Mostrar puntaje y vida en el lado derecho
    textSize(20);
    fill(255);
    textAlign(RIGHT);
    text(`Puntaje: ${puntaje}`, width - 10, 30);
    text(`Vida: ${vida}%`, width - 10, 60);
  }
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
    if (pantallaBienvenida) {
      pantallaBienvenida = false;
    }
    sonidoDisparo.play();
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
    this.imagen = loadImage("Resized_Nave.png");
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
  constructor(imagenes, x, y, velocidadX, velocidadY) {
    this.imagenes = imagenes;
    this.x = x;
    this.y = y;
    this.ancho = 100;
    this.alto = 100;
    this.velocidadX = velocidadX;
    this.velocidadY = velocidadY;
    this.puntos = 10;
    this.frame = 0;
    this.vida = 10;
    this.explotando = false;
    this.explosionFrame = 0; // Cada enemigo tiene su propia variable explosionFrame
  }

  update() {
    if (this.explotando) {
      this.explosionFrame++;
      if (this.explosionFrame >= explosionImages.length) {
        // Eliminar este enemigo de la lista cuando la explosión ha terminado
        let index = enemigos.indexOf(this);
        if (index !== -1) {
          enemigos.splice(index, 1);
        }
      }
    } else {
      this.x += this.velocidadX;
      this.y += this.velocidadY;
      if (this.y > height) {
        let index = enemigos.indexOf(this);
        if (index !== -1) {
          enemigos.splice(index, 1);
        }
      }
      this.frame = (this.frame + 1) % this.imagenes.length;
    }
  
    if (this.vida <= 0 && !this.explotando) {
      this.activarExplosion();
    }
  }
  

  show() {
    if (this.explotando) {
      image(explosionImages[this.explosionFrame], this.x, this.y, this.ancho, this.alto);
    } else {
      image(this.imagenes[this.frame], this.x, this.y, this.ancho, this.alto);
    }
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
    this.vida -= dano;
  }

  estaMuerto() {
    return this.vida <= 0;
  }

  activarExplosion() {
    this.explotando = true;
    this.explosionFrame = 0;
    sonidoExplosion.play();
  }

  estaExplotando() {
    return this.explotando && this.explosionFrame < explosionImages.length;
  }
}

function generarEnemigos1() {
  let x = random(width - 100);
  let y = -100;
  let velocidadX = 0;
  let velocidadY = random(1, 5);
  let imagenes = marcianoImages;
  enemigos.push(new Enemigo(imagenes, x, y, velocidadX, velocidadY));
}

function generarEnemigos2() {
  let x, y, velocidadX, velocidadY, imagenes;

  if (random(1) < 0.5) {
    x = -100;
    y = random(height - 100);
    velocidadX = random(1, 5);
    velocidadY = 0;
    imagenes = helicopter1Images;
  } else {
    x = width;
    y = random(height - 100);
    velocidadX = -random(1, 5);
    velocidadY = 0;
    imagenes = helicopterImages;
  }

  enemigos.push(new Enemigo(imagenes, x, y, velocidadX, velocidadY));
}

setInterval(generarEnemigos1, tiempoGenerarEnemigo);
setInterval(generarEnemigos2, tiempoGenerarEnemigo);
