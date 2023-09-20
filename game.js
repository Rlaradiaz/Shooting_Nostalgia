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
let tiempoGenerarEnemigo = 1000; // Generar enemigos cada 60 segundos (en milisegundos)
let musicaFondo;
let imagenBienvenida;
let pantallaBienvenida = true;
let tiempoPausa = 0;
let fondoActual = 0;
let fondoSiguiente = 1;
let transicion = 0;
let boss = null; // Variable para el jefe
let bossAppeared = false;
let juegoEnCurso = false;
let pantallaGameOver = false; 
let aparecerEnemigosTipo2 = false;
let perseguirEnemigos = false; // Variable global para controlar si los enemigos deben perseguir al jugador
let derrotoAlBoss = false;



window.onload = function () {
  // Ocultar la imagen
  let catImage = document.getElementById("cat-image");
  catImage.style.display = "none";

  // Luego, inicia el juego
  startGame();
};


function logError(message) {
  console.error(message);
}

function preload() {

  getAudioContext().resume();
  // Cargar imágenes
  for (let i = 1; i <= 15; i++) {
    marcianoImages.push(loadImage(`marciano/${i}.png`, imagenCargada, imagenError));
  }
  for (let i = 1; i <= 8; i++) {
    helicopterImages.push(loadImage(`helicoptero2/${i}.png`, imagenCargada, imagenError));
    helicopter1Images.push(loadImage(`helicoptero3/${i}.png`, imagenCargada, imagenError));
  }
  for (let i = 1; i <= 7; i++) {
    bossImages.push(loadImage(`Boss/${i}.png`, imagenCargada, imagenError));
  }
  for (let i = 1; i <= 12; i++) {
    explosionImages.push(loadImage(`explosion/${i}.png`, () => console.log(`Cargada imagen de explosión ${i}`)));
  }
  for (let i = 1; i <= 4; i++) {
    fondoImages.push(loadImage(`imagenes/juego${i}.jpg`, imagenCargada, imagenError));
  }

  // Cargar sonidos y otros recursos aquí...

  sonidoDisparo = loadSound('sounds/laser.wav', sonidoCargado, sonidoError);
  sonidoExplosion = loadSound('sounds/explosion.wav', sonidoCargado, sonidoError);
  musicaFondo = loadSound('mega.mp3', sonidoCargado, sonidoError);
  imagenBienvenida = loadImage('imagenes/cat.jpeg');
  musicaFondo.setVolume(0.2);
}


function imagenCargada(img) {
  console.log(`Imagen cargada: ${img.src}`);
}

function imagenError(err) {
  console.error(`Error al cargar la imagen: ${err.path}`);
}

function sonidoCargado(sound) {
  console.log(`Sonido cargado: ${sound.url}`);
}

function sonidoError(err) {
  console.error(`Error al cargar el sonido: ${err.path}`);
}

function setup() {
  // Obtener el tamaño de una de las imágenes de fondo (suponiendo que todas son del mismo tamaño)
  let fondoWidth = fondoImages[0].width;
  let fondoHeight = fondoImages[0].height;

   

  // Crear el lienzo con el ancho de la imagen de fondo y la altura de la ventana
  createCanvas(fondoWidth, windowHeight);
  
  jugador = new Jugador(width / 2, height - 50);
  imagenBienvenida.resize(width, height);
  boss = new Boss(bossImages, width / 2, -200, 0, 2);

     
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

    if (puntaje >= 500 && !aparecerEnemigosTipo2) {
      aparecerEnemigosTipo2 = true;

    }  

    if (!boss.aparecido && puntaje >= 4000) {
      boss.aparecido = true; // Establece this.aparecido en true para que el jefe aparezca
        
    }
    if (boss.vida <= 0 && !derrotoAlBoss) {
      derrotoAlBoss = true;
      puntaje += 200; // Suma 200 puntos al puntaje del jugador
    }

    if (puntaje >= 1300) {
      // Activa la persecución de enemigos
      perseguirEnemigos = true;
        }
      
    
     

  
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

      let balaColisionoConEnemigo = false; // Variable para rastrear si la bala colisionó con un enemigo

      for (let j = enemigos.length - 1; j >= 0; j--) {
        let enemigo = enemigos[j];
        if (bala.hits(enemigo)) {
          // Marcamos que la bala colisionó con un enemigo
          balaColisionoConEnemigo = true;

          // Reducimos la vida del enemigo y activamos la explosión si es necesario
          if (enemigo.recibirDano(10)) {
            puntaje += enemigo.puntos;
          }

          // Eliminamos la bala
          balas.splice(i, 1);
          break; // Salimos del bucle interno una vez que la bala colisiona con un enemigo
        }
      }

      // Si la bala no colisionó con ningún enemigo y sale de la pantalla, eliminarla
      if (!balaColisionoConEnemigo && bala.y < 0) {
        balas.splice(i, 1);
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

    // Llama al método aparecer del jefe
    boss.aparecer();
  }
}

function keyPressed() {
  if (pantallaBienvenida) {
    pantallaBienvenida = false;
    musicaFondo.loop();
  } else {
    if (!pantallaGameOver) { // Solo manejar las teclas si no estás en la pantalla de Game Over
      if (key === ' ') {
        console.log("Key pressed: Espacio"); // Agrega esta línea para mostrar el log
        jugador.disparar();
      } else {
        if (key === 'p') {
          if (juegoEnPausa) {
            let tiempoPausado = millis() - tiempoPausa;
            tiempoUltimoEnemigo += tiempoPausado;
            musicaFondo.play();
            loop();
          } else {
            tiempoPausa = millis();
            musicaFondo.pause();
            noLoop();
          }
          juegoEnPausa = !juegoEnPausa;
        } else {
          let movimientoX = 0;
          let movimientoY = 0;

          if (keyCode === LEFT_ARROW) {
            movimientoX = -1;
          } else if (keyCode === RIGHT_ARROW) {
            movimientoX = 1;
          } else if (keyCode === UP_ARROW) {
            movimientoY = -1;
          } else if (keyCode === DOWN_ARROW) {
            movimientoY = 1;
          }

          jugador.setMovimiento(movimientoX, movimientoY);
        }
      }
    } else if (key === 'r') { // Si estás en la pantalla de Game Over, presionar 'R' para reiniciar
      resetGame();
    }
  }
}



function keyReleased() {
  jugador.setMovimiento(0, 0);
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
  pantallaGameOver = true; // Estás en la pantalla de Game Over
}


class Jugador {
  constructor(x, y) {
    this.imagen = loadImage("Resized_Nave.png");
    this.ancho = 100;
    this.alto = 100;
    this.x = x;
    this.y = y;
    this.velocidadX = 0;
    this.velocidadY = 0;
    this.vida = 100;
    this.ultimaDireccionX = 0;
    this.ultimaDireccionY = -1; // Inicialmente apunta hacia arriba
  }

  update() {
    this.velocidadX = 0;
    this.velocidadY = 0;
    
    if (keyIsDown(LEFT_ARROW)) {
      this.velocidadX = -5;
      this.ultimaDireccionX = -1;
      this.ultimaDireccionY = 0;
    } else if (keyIsDown(RIGHT_ARROW)) {
      this.velocidadX = 5;
      this.ultimaDireccionX = 1;
      this.ultimaDireccionY = 0;
    }

    if (keyIsDown(UP_ARROW)) {
      this.velocidadY = -5;
      this.ultimaDireccionX = 0;
      this.ultimaDireccionY = -1;
    } else if (keyIsDown(DOWN_ARROW)) {
      this.velocidadY = 5;
      this.ultimaDireccionX = 0;
      this.ultimaDireccionY = 1;
    }

    this.x += this.velocidadX;
    this.y += this.velocidadY;

    this.x = constrain(this.x, 0, width - this.ancho);
    this.y = constrain(this.y, 0, height - this.alto);
  }

  show() {
    image(this.imagen, this.x, this.y, this.ancho, this.alto);
  }

  setMovimiento(x, y) {
    if (x === 0 && y === 0) {
      // Si no se presiona ninguna tecla de movimiento, establecer movimiento a cero
      this.velocidadX = 0;
      this.velocidadY = 0;
    } else {
      this.velocidadX = x;
      this.velocidadY = y;
    }
  }

  recibirDano(dano) {
    this.vida -= dano;
    if (this.vida <= 0) {
      gameOver();
    }
  }

  disparar() {
    console.log("Disparar");
    sonidoDisparo.play();

    if (puntaje < 2500) {
      // Disparar solo una bala hacia arriba
      let bala = new Bala(
        this.x + this.ancho / 2,
        this.y,
        0,
        -1 // La dirección Y es siempre hacia arriba (negativa)
      );
      balas.push(bala);
    } else {
      // Disparar en las cuatro direcciones con imágenes diferentes
      let balaArriba = new Bala(this.x + this.ancho / 2, this.y, 0, -1, "arriba");
      let balaAbajo = new Bala(this.x + this.ancho / 2, this.y + this.alto, 0, 1, "abajo");
      let balaDerecha = new Bala(this.x + this.ancho, this.y + this.alto / 2, 1, 0, "derecha");
      let balaIzquierda = new Bala(this.x, this.y + this.alto / 2, -1, 0, "izquierda");

      balas.push(balaArriba, balaAbajo, balaDerecha, balaIzquierda);
    }
  }
}

class Bala {
  constructor(x, y, direccionX, direccionY, direccion) {
    this.x = x;
    this.y = y;
    this.velY = direccionY * 10; // Velocidad ajustada
    this.velX = direccionX * 10; // Velocidad ajustada
    this.ancho = direccion ? 80 : 10; // Ancho personalizado si tiene dirección
    this.alto = direccion ? 80 : 20; // Alto personalizado si tiene dirección
    this.danio = 10;
    
    if (direccion) {
      this.cargarImagen(direccion);
    }
  }

  cargarImagen(direccion) {
    if (direccion === "arriba") {
      this.imagen = loadImage("imagenes/Arriba.png");
    } else if (direccion === "abajo") {
      this.imagen = loadImage("imagenes/Abajo.png");
    } else if (direccion === "derecha") {
      this.imagen = loadImage("imagenes/Derecha.png");
    } else if (direccion === "izquierda") {
      this.imagen = loadImage("imagenes/Izquierda.png");
    }
  }
  show() {
    image(this.imagen, this.x, this.y, this.ancho, this.alto); // Escala la imagen al ancho y alto personalizados
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;
  }

  show() {
    if (this.imagen) {
      image(this.imagen, this.x, this.y, this.ancho, this.alto);
    } else {
      // Dibuja una forma predeterminada si la imagen no está cargada
      fill(255, 0, 0);
      noStroke();
      rect(this.x, this.y, this.ancho, this.alto);
    }
  }

  hits(enemigo) {
    return (
      this.x + this.ancho / 2 > enemigo.x &&
      this.x + this.ancho / 2 < enemigo.x + enemigo.ancho &&
      this.y > enemigo.y &&
      this.y < enemigo.y + enemigo.alto
    );
  }
}

class Boss {
  constructor(imagenes) {
    this.imagenes = imagenes;
    this.x = width / 2 - 100; // Inicia en el centro de la pantalla
    this.y = -200; // Fuera de la pantalla arriba
    this.ancho = 400;
    this.alto = 400;
    this.velocidadX = 2;
    this.velocidadY = 1;
    this.directionX = -1;
    this.directionY = 1;
    this.imageIndex = 0;
    this.puntos = 200;
    this.intervaloCambioImagen = 100;
    this.tiempoCambioImagen = millis();
    this.vida = 2000;
    this.apareceEnPuntaje = 4000;
    this.aparecido = false;
    this.explotando = false;
    this.explosionFrame = 0;
    this.haColisionadoConJugador = false;
    
  }

  update() {
    if (this.explotando) {
      this.explosionFrame++;
      if (this.explosionFrame >= explosionImages.length) {
        // Eliminar al jefe de la lista cuando la explosión ha terminado
        let index = enemigos.indexOf(this);
        if (index !== -1) {
          enemigos.splice(index, 1);
        }
      }
    } else if (this.vida <= 0) {
      // Si el jefe no está explotando y su vida llega a 0 o menos, activar la explosión
      this.activarExplosion();
    } else {
      // Mover el jefe horizontalmente según su dirección actual
      this.x += this.velocidadX * this.directionX;

      // Cambiar la dirección horizontal si toca los límites de la pantalla
      if (this.x <= 0 && this.directionX === -1) {
        this.directionX = 1;
      }
      if (this.x + this.ancho >= width && this.directionX === 1) {
        this.directionX = -1;
      }

      // Mover el jefe verticalmente según su dirección actual
      this.y += this.velocidadY * this.directionY;

      // Cambiar la dirección vertical si toca los límites de la pantalla
      if (this.y <= 0 && this.directionY === -1) {
        this.directionY = 1;
      }
      if (this.y + this.alto >= height && this.directionY === 1) {
        this.directionY = -1;
      }

      // Controlar el cambio de imagen a una velocidad más lenta
      let tiempoActual = millis();
      if (tiempoActual - this.tiempoCambioImagen >= this.intervaloCambioImagen) {
        this.imageIndex = (this.imageIndex + 1) % this.imagenes.length;
        this.tiempoCambioImagen = tiempoActual;
      }
    }
  }

  show() {
    if (this.explotando) {
      if (explosionImages[this.explosionFrame]) {
        image(explosionImages[this.explosionFrame], this.x, this.y, this.ancho, this.alto);
      } else {
        console.log(`Imagen de explosión ${this.explosionFrame} no definida.`);
        logError(`Imagen de explosión ${this.explosionFrame} no definida.`);
      }
    } else {
      if (this.imagenes[this.imageIndex]) {
        image(this.imagenes[this.imageIndex], this.x, this.y, this.ancho, this.alto);
      } else {
        console.log(`Imagen ${this.imageIndex} no definida.`);
        logError(`Imagen ${this.imageIndex} no definida.`);
      }
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
        jugador.recibirDano(20);
        this.haColisionadoConJugador = true;
      }
      if (!this.explotando) {
        this.activarExplosion();
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

  aparecer() {
    // Comprobar si el jefe ha aparecido
    if (!this.aparecido && puntaje >= this.apareceEnPuntaje) {
      // Ajustar la posición inicial del jefe
      this.x = width / 2 - this.ancho / 2;
      this.y = -this.alto;
      this.aparecido = true;
      enemigos.push(this); // Agregar al jefe a la lista de enemigos
    }
  }
}



class Enemigo {
  constructor(imagenes, x, y, velocidadX, velocidadY, tipo) {
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
    this.haColisionadoConJugador = false;
    this.tipo = tipo;
    this.perseguirJugador = false;
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

    // Si el puntaje alcanza 1000 y el enemigo es de tipo 1, persigue al jugador
    if (this.tipo === 1 && perseguirEnemigos) {
      let distanciaX = jugador.x - this.x;
      let distanciaY = jugador.y - this.y;
      let distancia = sqrt(distanciaX * distanciaX + distanciaY * distanciaY);
      let angulo = atan2(distanciaY, distanciaX);
      let velocidadEnemigo = 2; // Ajusta la velocidad según sea necesario
      let velocidadX = velocidadEnemigo * cos(angulo);
      let velocidadY = velocidadEnemigo * sin(angulo);
      this.x += velocidadX;
      this.y += velocidadY;
    }
  }

  show() {
    if (this.explotando) {
      if (explosionImages[this.explosionFrame]) {
        image(explosionImages[this.explosionFrame], this.x, this.y, this.ancho, this.alto);
      } else {
        console.log(`Imagen de explosión ${this.explosionFrame} no definida.`);
        logError(`Imagen de explosión ${this.explosionFrame} no definida.`);
      }
    } else {
      if (this.imagenes[this.frame]) {
        image(this.imagenes[this.frame], this.x, this.y, this.ancho, this.alto);
      } else {
        console.log(`Imagen ${this.frame} no definida.`);
        logError(`Imagen ${this.frame} no definida.`);
      }
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
        jugador.recibirDano(20);
        this.haColisionadoConJugador = true;
      }
      if (!this.explotando) {
        this.activarExplosion();
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
  let tipo = 1; // Define el tipo de enemigo (1 para persecución)
  enemigos.push(new Enemigo(imagenes, x, y, velocidadX, velocidadY, tipo));
}

function generarEnemigos2() {
  if (aparecerEnemigosTipo2) {
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



function resetGame() {
  fondoY = 0;
  puntaje = 0;
  vida = 100;
  tiempoUltimoEnemigo = millis();
  enemigos = [];
  balas = [];
  jugador = new Jugador(width / 2, height - 50);
  boss.aparecido = false;
  boss.explotando = false;
  boss.explosionFrame = 0;
  derrotoAlBoss = false;
  boss.haColisionadoConJugador = false;
  pantallaGameOver = false; // Restablece la pantalla de Game Over
  juegoEnPausa = false; // Restablece el juego en pausa
  aparecerEnemigosTipo2 = false; // Asegúrate de restablecer esta variable
  perseguirEnemigos = false; // Detiene la persecución de enemigos
  boss = new Boss(bossImages, width / 2, -200, 0, 2);
  
  // Asegúrate de que el jefe siempre aparezca al reiniciar el juego
  boss.apareceEnPuntaje = 4000;
  
  // Detener la música actual y luego volver a reproducirla desde el principio
  if (musicaFondo.isPlaying()) {
    musicaFondo.stop();
  }
  musicaFondo.play();

  loop(); // Reinicia el bucle principal del juego
}

