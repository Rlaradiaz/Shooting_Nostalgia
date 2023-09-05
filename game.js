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
let tiempoGenerarEnemigo = 2000; // Generar enemigos cada 60 segundos (en milisegundos)
let musicaFondo;
let imagenBienvenida;
let pantallaBienvenida = true;
let tiempoPausa = 0;
let fondoActual = 0;
let fondoSiguiente = 1;
let transicion = 0;

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

  // Crear el lienzo con el ancho de la imagen de fondo y la altura de la ventana
  createCanvas(fondoWidth, windowHeight);

  jugador = new Jugador(width / 2, height - 50);
  imagenBienvenida.resize(width, height);
}

function windowResized() {
  // Ajustar el ancho del lienzo al ancho de la imagen de fondo
  let fondoWidth = fondoImages[0].width;
  resizeCanvas(fondoWidth, windowHeight);
}

function draw() {
  if (pantallaBienvenida) {
    // Muestra la imagen de bienvenida
    image(imagenBienvenida, 0, 0);

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

    // Generar enemigos solo si el juego no está en pausa
    if (!juegoEnPausa && millis() - tiempoUltimoEnemigo > tiempoGenerarEnemigo) {
      if (random(1) < 0.5) {
        generarEnemigos1();
      } else {
        generarEnemigos2();
      }
      tiempoUltimoEnemigo = millis();
    }

    // Actualizar y mostrar balas
    for (let i = balas.length - 1; i >= 0; i--) {
      let bala = balas[i];
      bala.update();
      bala.show();

      // Variable para verificar si la bala colisionó con algún enemigo
      let balaColisiono = false;

      // Comprobar colisiones con enemigos
      for (let j = enemigos.length - 1; j >= 0; j--) {
        let enemigo = enemigos[j];
        if (bala.hits(enemigo)) {
          // Marcamos que la bala colisionó con un enemigo
          balaColisiono = true;

          // Reducimos la vida del enemigo y activamos la explosión si es necesario
          if (enemigo.recibirDano(10)) {
            puntaje += enemigo.puntos;
          }

          // Eliminamos la bala
          balas.splice(i, 1);

          // No es necesario eliminar el enemigo aquí
          // Ya que solo queremos eliminarlo una vez que explote
        }
      }
    }

    // Actualizar y mostrar enemigos
    for (let i = enemigos.length - 1; i >= 0; i--) {
      let enemigo = enemigos[i];
      enemigo.update();

      if (enemigo.estaMuerto() && !enemigo.estaExplotando()) {
        enemigo.activarExplosion();
      } else {
        enemigo.show();
      }

      if (enemigo.hits(jugador)) {
        vida -= 10;
        if (vida <= 0) {
          gameOver();
        }
        break; // Romper el bucle si el jugador es golpeado
      }
    }

    // Mostrar puntaje y vida en el lado derecho
    textSize(20);
    fill(255);
    textAlign(RIGHT);
    text(`Puntaje: ${puntaje}`, width - 10, 30);
    text(`Vida: ${vida}%`, width - 10, 60);
  }
}

function keyPressed() {
  if (pantallaBienvenida) {
    pantallaBienvenida = false;
    musicaFondo.loop(); // Reproducir música al presionar una tecla y hacer que se repita
  } else {
    if (keyCode === LEFT_ARROW) {
      jugador.setMovimiento(-5, 0);
    } else if (keyCode === RIGHT_ARROW) {
      jugador.setMovimiento(5, 0);
    } else if (keyCode === UP_ARROW) {
      jugador.setMovimiento(0, -5);
    } else if (keyCode === DOWN_ARROW) {
      jugador.setMovimiento(0, 5);
    } else if (key === ' ' && !juegoEnPausa) {
      balas.push(new Bala(jugador.x + jugador.ancho / 2, jugador.y));
      sonidoDisparo.play();
    } else if (key === 'p') {
      juegoEnPausa = !juegoEnPausa;
      if (juegoEnPausa) {
        tiempoPausa = millis();
        musicaFondo.pause(); // Pausar la música cuando el juego está en pausa
        noLoop();
      } else {
        let tiempoPausado = millis() - tiempoPausa;
        tiempoUltimoEnemigo += tiempoPausado; // Añadir el tiempo pausado al tiempo de generación de enemigos
        musicaFondo.play(); // Reanudar la música cuando el juego se reanuda
        loop();
      }
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    jugador.setMovimiento(0, 0);
  } else if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    jugador.setMovimiento(0, 0);
  }
}

function gameOver() {
  background(0);
  textSize(50);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);
  textSize(32);
  text("Presiona 'R' para volver a intentar", width / 2, height / 2 + 50);
  noLoop();
}

function resetGame() {
  fondoY = 0;
  puntaje = 0;
  vida = 100;
  tiempoUltimoEnemigo = millis();
  enemigos = [];
  balas = [];
  jugador = new Jugador(width / 2, height - 50);
  loop();
}

class Jugador {
  constructor(x, y) {
    this.imagen = loadImage("Resized_Nave.png");
    this.ancho = 100;
    this.alto = 100;
    this.x = x;
    this.y = y;
    this.movimientoX = 0;
    this.movimientoY = 0;
    this.vida = 100; // Agrega la vida del jugador y establece su valor inicial
  }

  update() {
    this.x += this.movimientoX;
    this.y += this.movimientoY;

    this.x = constrain(this.x, 0, width - this.ancho);
    this.y = constrain(this.y, 0, height - this.alto);
  }

  show() {
    image(this.imagen, this.x, this.y, this.ancho, this.alto);
  }

  setMovimiento(x, y) {
    this.movimientoX = x;
    this.movimientoY = y;
  }

  recibirDano(dano) {
    this.vida -= dano; // Reducir la vida del jugador en la cantidad especificada.
    if (this.vida <= 0) {
      gameOver(); // Llamar a la función de Game Over cuando la vida del jugador llega a 0 o menos.
    }
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
    this.explosionFrame = 0;
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
    } else if (this.vida <= 0) {
      // Si el enemigo no está explotando y su vida llega a 0 o menos, activar la explosión
      this.activarExplosion();
    } else {
      this.x += this.velocidadX;
      this.y += this.velocidadY;
      if (this.y > height) {
        // Eliminar al enemigo si se sale de la pantalla
        let index = enemigos.indexOf(this);
        if (index !== -1) {
          enemigos.splice(index, 1);
        }
      }
      this.frame = (this.frame + 1) % this.imagenes.length;
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
    if (
      this.x < jugador.x + jugador.ancho &&
      this.x + this.ancho > jugador.x &&
      this.y < jugador.y + jugador.alto &&
      this.y + this.alto > jugador.y
    ) {
      if (!this.explotando && !this.haColisionadoConJugador) {
        jugador.recibirDano(20); // Disminuir la vida del jugador en 20.
        this.haColisionadoConJugador = true; // Marcar que ya ha colisionado con el jugador
      }
      if (!this.explotando) {
        this.activarExplosion(); // Activar la explosión del enemigo si aún no lo está.
      }
      return true;
    }
    return false;
  }
  
  

  recibirDano(dano) {
    this.vida -= dano;
    if (this.vida <= 0 && !this.explotando) {
      this.activarExplosion();
      return true;
    }
    return false;
  }

  estaMuerto() {
    return this.vida <= 0;
  }

  activarExplosion() {
    this.explotando = true;
    this.explosionFrame = 0;
    sonidoExplosion.play();
    puntaje += this.puntos;
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

function generarEnemigos() {
  if (!juegoEnPausa) {
    if (random(1) < 0.5) {
      generarEnemigos1();
    } else {
      generarEnemigos2();
    }
  }
}

setInterval(generarEnemigos, tiempoGenerarEnemigo);

function keyPressed() {
  if (pantallaBienvenida) {
    pantallaBienvenida = false;
    musicaFondo.loop(); // Reproducir música al presionar una tecla y hacer que se repita
  } else {
    if (keyCode === LEFT_ARROW) {
      jugador.setMovimiento(-5, 0);
    } else if (keyCode === RIGHT_ARROW) {
      jugador.setMovimiento(5, 0);
    } else if (keyCode === UP_ARROW) {
      jugador.setMovimiento(0, -5);
    } else if (keyCode === DOWN_ARROW) {
      jugador.setMovimiento(0, 5);
    } else if (key === ' ' && !juegoEnPausa) {
      balas.push(new Bala(jugador.x + jugador.ancho / 2, jugador.y));
      sonidoDisparo.play();
    } else if (key === 'p') {
      juegoEnPausa = !juegoEnPausa;
      if (juegoEnPausa) {
        tiempoPausa = millis();
        musicaFondo.pause(); // Pausar la música cuando el juego está en pausa
        noLoop();
      } else {
        let tiempoPausado = millis() - tiempoPausa;
        tiempoUltimoEnemigo += tiempoPausado; // Añadir el tiempo pausado al tiempo de generación de enemigos
        musicaFondo.play(); // Reanudar la música cuando el juego se reanuda
        loop();
      }
    } else if (key === 'r') {
      resetGame();
    }
  }
}

function resetGame() {
  fondoY = 0;
  puntaje = 0;
  vida = 100;
  tiempoUltimoEnemigo = millis();
  enemigos = [];
  balas = [];
  jugador = new Jugador(width / 2, height - 50);
  loop();
}
