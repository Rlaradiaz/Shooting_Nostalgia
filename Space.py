# Shooting Nostalgia
# Autor: Rodrigo Lara



import pygame
import random
import sys
from PIL import Image
import os


# image resized

Bossx = Image.open("bossxx.png")
new_width = 300
new_heigt = 300
resized_image=Bossx.resize((new_width,new_heigt))
resized_image.save("boosx.png")



# Init
pygame.init()

# Music
pygame.mixer.init()
pygame.mixer.music.load("imagenes/Mega.mp3")
pygame.mixer.music.play(-1)
pygame.mixer.music.set_volume(0.8)


# Obtener el tamaño de la pantalla del dispositivo
info = pygame.display.Info()
screen_width = info.current_w
screen_height = info.current_h

# Crear la pantalla
screen = pygame.display.set_mode((screen_width, screen_height))


# Background
fondo1 = pygame.image.load("imagenes/juego1.jpg")
fondo2 = pygame.image.load("imagenes/juego2.jpg")
fondo3 = pygame.image.load("imagenes/juego3.jpg")
fondo4 = pygame.image.load("imagenes/juego4.jpg")


#Fondo adaptable a pantalla
fondo1 = pygame.transform.scale(fondo1, (screen_width, screen_height))  # Tamaño de la pantalla del dispositivo
fondo2 = pygame.transform.scale(fondo2, (screen_width, screen_height))
fondo3 = pygame.transform.scale(fondo3, (screen_width, screen_height))  # Tamaño de la pantalla del dispositivo
fondo4 = pygame.transform.scale(fondo4, (screen_width, screen_height))

# Initial positions
fondo1_y = 0
fondo2_y = -fondo1.get_height()
fondo3_y = -fondo2.get_height() * 2
fondo4_y = -fondo3.get_height() * 3

# Background speed
background_speed = 1

def draw_backgrounds():
    screen.blit(fondo1, (0, fondo1_y))
    screen.blit(fondo2, (0, fondo2_y))
    screen.blit(fondo3, (0, fondo3_y))
    screen.blit(fondo4, (0, fondo4_y))

def draw_transition(transicion_alpha):
    transicion_mask = pygame.Surface((screen_width, screen_height))
    transicion_mask.fill((0, 0, 0))  # Puedes cambiar el color de la máscara según tus preferencias
    transicion_mask.set_alpha(transicion_alpha)
    screen.blit(transicion_mask, (0, 0))

run = True
transicion_alpha = 255  # Comienza con el valor máximo para el fade-in


# Sounds
laser_sonido = pygame.mixer.Sound("laser.wav")
explosion_sonido = pygame.mixer.Sound("explosion.wav")
golpe_sonido = pygame.mixer.Sound("-miau-.mp3")



# explosion animation    
explosion_list = []
for i in range(1, 13):
    explosion = pygame.image.load(f"explosion/{i}.png")
    explosion_list.append(explosion)
    
marciano_list = []
for i in range(1, 16):
    marciano = pygame.image.load(f"marciano/{i}.png")
    marciano_list.append(marciano)  


helicopter_list = []
for i in range(1, 9):
    helicopter = pygame.image.load(f"helicoptero/{i}.png")
    helicopter_list.append(helicopter) 

helicopter1_list = []
for i in range(1, 9):
    helicopter1 = pygame.image.load(f"helicoptero1/{i}.png")
    helicopter1_list.append(helicopter1)   

Boss_list = []
for i in range(1, 7):
    image_path = os.path.join("Boss", f"{i}.png")
    Bossx = pygame.image.load(image_path)
    # Redimensionar la imagen a 300x300
    Bossx = pygame.transform.scale(Bossx, (500, 500))
    Boss_list.append(Bossx)
# Background config

width = fondo1.get_width()
height = fondo1.get_height()

pygame.display.set_caption("Shooting Nostalgia")
run = True
fps = 60
clock = pygame.time.Clock()
score = 0
vida = 100
blanco = (255, 255, 255)  
negro = (0, 0, 0)




def show_start_screen():
    start_screen_image = pygame.image.load("imagenes/cat.jpeg")
    start_screen_image = pygame.transform.scale(start_screen_image, (screen_width, screen_height))
    screen.blit(start_screen_image, (0, 0))
    pygame.display.flip()
    

def wait_for_key():
    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                waiting = False     

show_start_screen()
wait_for_key()

def texto_puntuacion(frame, text, size, x, y):
    font = pygame.font.SysFont("Small Fonts", size, bold=True)
    text_frame = font.render(text, True, blanco, negro)
    text_rect = text_frame.get_rect()
    text_rect.midtop = (x, y)
    frame.blit(text_frame, text_rect)


# Add this variable to track if the game is paused
game_paused = False

# Function to handle the pause screen
def pause_game():
    global game_paused
    paused_text = pygame.font.SysFont("Arial", 50).render("Paused", True, (255, 255, 255))
    resume_text = pygame.font.SysFont("Arial", 30).render("Press 'R' to Resume", True, (255, 255, 255))
    quit_text = pygame.font.SysFont("Arial", 30).render("Press 'Q' to Quit", True, (255, 255, 255))
    while game_paused:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    game_paused = False
                elif event.key == pygame.K_q:
                    pygame.quit()
                    sys.exit()
        
        # Display the pause screen
        screen.blit(paused_text, (width // 2 - paused_text.get_width() // 2, height // 2 - paused_text.get_height() // 2))
        screen.blit(resume_text, (width // 2 - resume_text.get_width() // 2, height // 2))
        screen.blit(quit_text, (width // 2 - quit_text.get_width() // 2, height // 2 + 40))
        pygame.display.flip()
        clock.tick(fps)    


# Life Bar
def barra_vida(frame, x, y, nivel):
    longitud = 100
    alto = 20
    fill = int((nivel / 100) * longitud)
    border = pygame.Rect(x, y, longitud, alto)
    fill = pygame.Rect(x, y, fill, alto)
    pygame.draw.rect(frame, (255, 0, 55), fill)
    pygame.draw.rect(frame, negro, border, 4)


# Game Over Screen
def show_game_over_screen():
    screen.fill((0, 0, 0))
    font = pygame.font.SysFont("Arial", 50)
    text_surface = font.render("Game Over", True, (255, 255, 255))
    text_rect = text_surface.get_rect()
    text_rect.center = (width // 2, height // 2)
    screen.blit(text_surface, text_rect)
    pygame.display.flip()
    pygame.time.delay(5000)


# Player Class


class Jugador(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.image.load("Resized_Nave.png").convert_alpha()
        pygame.display.set_icon(self.image)
        self.rect = self.image.get_rect()
        self.rect.centerx = width // 2
        self.rect.centery = height - 100
        self.velocidad_x = 0
        self.velocidad_y = 0  
        self.vida = 100

    def update(self):
        self.velocidad_x = 0
        self.velocidad_y = 0

        keystate = pygame.key.get_pressed()
        if keystate[pygame.K_LEFT]:
            self.velocidad_x = -5
            
        elif keystate[pygame.K_RIGHT]:
            self.velocidad_x = 5
        if keystate[pygame.K_UP]:
            self.velocidad_y = -5
        elif keystate[pygame.K_DOWN]:
            self.velocidad_y = 5

        self.rect.x += self.velocidad_x
        self.rect.y += self.velocidad_y

        if self.rect.right > width:
            self.rect.right = width
        elif self.rect.left < 0:
            self.rect.left = 0
        if self.rect.bottom > height:  
            self.rect.bottom = height
        elif self.rect.top < 0:
            self.rect.top = 0



    def disparar(self):
        if score >= 1200:
            # Disparar hacia arriba
            bala_arriba = Balas(self.rect.centerx, self.rect.top, 0, -15, "arriba")
            grupo_jugador.add(bala_arriba)
            grupo_balas_jugador.add(bala_arriba)

            # Disparar hacia abajo
            bala_abajo = Balas(self.rect.centerx, self.rect.bottom, 0, 15, "abajo")
            grupo_jugador.add(bala_abajo)
            grupo_balas_jugador.add(bala_abajo)

            # Disparar hacia la derecha
            bala_derecha = Balas(self.rect.right, self.rect.centery, 15, 0, "derecha")
            grupo_jugador.add(bala_derecha)
            grupo_balas_jugador.add(bala_derecha)

            # Disparar hacia la izquierda
            bala_izquierda = Balas(self.rect.left, self.rect.centery, -15, 0, "izquierda")
            grupo_jugador.add(bala_izquierda)
            grupo_balas_jugador.add(bala_izquierda)
        elif score >= 600:  # Solo disparar hacia arriba si el puntaje está entre 600 y 1199
            bala_arriba = Balas(self.rect.centerx, self.rect.top, 0, -15, "arriba")
            grupo_jugador.add(bala_arriba)
            grupo_balas_jugador.add(bala_arriba)

            # No permitir disparar en otras direcciones
        elif score >= 200:  # Disparar hacia la izquierda y hacia la derecha si el puntaje está entre 200 y 599
            bala_derecha = Balas(self.rect.right, self.rect.centery, 15, 0, "derecha")
            grupo_jugador.add(bala_derecha)
            grupo_balas_jugador.add(bala_derecha)

            bala_izquierda = Balas(self.rect.left, self.rect.centery, -15, 0, "izquierda")
            grupo_jugador.add(bala_izquierda)
            grupo_balas_jugador.add(bala_izquierda)
        else:  # Disparar hacia arriba si el puntaje es menor a 200
            bala_arriba = Balas(self.rect.centerx, self.rect.top, 0, -15, "arriba")
            grupo_jugador.add(bala_arriba)
            grupo_balas_jugador.add(bala_arriba)



import math

score_reached_2000 = False


class Enemigos(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.current_frame = 0
        self.images = []
        for i in range(1, 16):
            image_path = f"marciano/{i}.png"
            image = pygame.image.load(image_path).convert_alpha()
            self.images.append(image)

        self.image = self.images[self.current_frame]
        self.rect = self.image.get_rect()
        self.rect.x = random.randrange(1, width - 100)
        self.rect.y = y
        self.velocidad_y = random.randrange(1, 5)
        self.tiempo_cambio_imagen = pygame.time.get_ticks()
        self.intervalo_cambio_imagen = 50

        # Add a boolean variable to control enemy pursuit
        self.should_pursue = False

    def update(self):
        self.rect.y += self.velocidad_y

        if self.rect.y >= height:
            self.rect.y = random.randrange(-100, -50)
            self.rect.x = random.randrange(1, width - 100)
            self.velocidad_y = 1

        tiempo_actual = pygame.time.get_ticks()

        # Controlar el cambio de imagen a una velocidad más lenta
        if tiempo_actual - self.tiempo_cambio_imagen >= self.intervalo_cambio_imagen:
            self.current_frame = (self.current_frame + 1) % len(self.images)
            self.image = self.images[self.current_frame]
            self.tiempo_cambio_imagen = tiempo_actual

        # If the score hasn't reached 2000, do not pursue the player
        if not score_reached_2000:
            return

        # Calculate the distance between the enemy and the player
        player_x, player_y = player.rect.center
        enemy_x, enemy_y = self.rect.center
        distance_to_player = math.sqrt((player_x - enemy_x) ** 2 + (player_y - enemy_y) ** 2)

        # Calculate the angle to the player
        angle_to_player = math.atan2(player_y - enemy_y, player_x - enemy_x)

        # Calculate the x and y components of the enemy's velocity
        enemy_speed = 2  # Adjust the speed of pursuit as needed
        vel_x = enemy_speed * math.cos(angle_to_player)
        vel_y = enemy_speed * math.sin(angle_to_player)

        # Update the enemy's position based on the velocity
        self.rect.x += vel_x
        self.rect.y += vel_y
  
    # I change this function just to make another enemy
    def disparar_enemigos(self):
        bala = Meteoro(self.rect.centerx, self.rect.bottom)
        grupo_jugador.add(bala)
        grupo_balas_enemigos.add(bala)
        laser_sonido.play()

  
# bullets class
class Balas(pygame.sprite.Sprite):
    def __init__(self, x, y, velocidad_x, velocidad_y, direccion):
        super().__init__()

        if direccion == "arriba":
            self.image = pygame.image.load("imagenes/Arriba.png").convert_alpha()
        elif direccion == "abajo":
            self.image = pygame.image.load("imagenes/Abajo.png").convert_alpha()
        elif direccion == "derecha":
            self.image = pygame.image.load("imagenes/Derecha.png").convert_alpha()
        elif direccion == "izquierda":
            self.image = pygame.image.load("imagenes/Izquierda.png").convert_alpha()
        else:
            # Si no se proporciona una dirección válida, usa una imagen predeterminada
            self.image = pygame.image.load("imagenes/bala_predeterminada.png").convert_alpha()

        self.rect = self.image.get_rect()
        self.rect.centerx = x
        self.rect.y = y
        self.velocidad_x = velocidad_x
        self.velocidad_y = velocidad_y

    def update(self):
        self.rect.x += self.velocidad_x
        self.rect.y += self.velocidad_y
        if self.rect.bottom < 0:
            self.kill()



images_from_left = []
for i in range(1, 9):
    image_path_left = f"helicoptero1/{i}.png"
    image_left = pygame.image.load(image_path_left).convert_alpha()
    images_from_left.append(image_left)

# Cargar las imágenes para los enemigos que aparecen desde la derecha
images_from_right = []
for i in range(1, 9):
    image_path_right = f"helicoptero/{i}.png"
    image_right = pygame.image.load(image_path_right).convert_alpha()
    images_from_right.append(image_right)

class Enemigos2(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.current_frame = 0
        self.images_from_left = images_from_left  # Lista de imágenes para enemigos que aparecen desde la izquierda
        self.images_from_right = images_from_right  # Lista de imágenes para enemigos que aparecen desde la derecha

        self.images = self.images_from_left  # Inicialmente, utilizamos las imágenes desde la izquierda
        self.image = self.images[self.current_frame]
        self.rect = self.image.get_rect()

    

        # Posiciones y velocidades aleatorias
        self.spawn_from_left = random.choice([True, False]) 
        if self.spawn_from_left:
            self.rect.x = -self.rect.width  # Posición inicial desde la izquierda
            self.velocidad_x = random.randrange(1, 6)  # Movimiento hacia la derecha
        else:
            self.rect.x = screen_width  # Posición inicial desde la derecha
            self.velocidad_x = random.randrange(-5, 0)  # Movimiento hacia la izquierda

        self.rect.y = random.randrange(1, screen_height // 1 + -100 )
        self.tiempo_cambio_imagen = pygame.time.get_ticks()  # Variable para controlar el tiempo de cambio de imagen
        self.intervalo_cambio_imagen = 100 # Intervalo de tiempo en milisegundos para cambiar de imagen

    def update(self):
        self.rect.x += self.velocidad_x

        if self.rect.right <= 0:  # Si el enemigo sale completamente de la pantalla por la izquierda
            self.rect.x = screen_width  # Reiniciar posición x al ancho de la pantalla
            self.rect.y = random.randrange(1, screen_height // 1 + -100 ) 
            self.velocidad_x = random.randrange(1, 6)  # Generar una nueva velocidad x aleatoria hacia la derecha
        
        elif self.rect.left >= screen_width:  # Si el enemigo sale completamente de la pantalla por la derecha
            self.rect.x = -self.rect.width  # Reiniciar posición x a la izquierda de la pantalla
            self.rect.y = random.randrange(1, screen_height // 1 + -100 )
            self.velocidad_x = random.randrange(-5, 0)  # Generar una nueva velocidad x aleatoria hacia la izquierda

        tiempo_actual = pygame.time.get_ticks()

        # Controlar el cambio de imagen a una velocidad más lenta
        if tiempo_actual - self.tiempo_cambio_imagen >= self.intervalo_cambio_imagen:
            # Cambiar las imágenes dependiendo de la dirección de aparición
            if self.spawn_from_left:
                self.images = self.images_from_left
            else:
                self.images = self.images_from_right

            self.current_frame = (self.current_frame + 1) % len(self.images)
            self.image = self.images[self.current_frame]
            self.tiempo_cambio_imagen = tiempo_actual


class Balas_enemigos(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.image.load("Resized_Meteoro.png").convert_alpha()
        self.rect = self.image.get_rect()
        self.rect.centerx = x

        self.velocidad_y = 4

    def update(self):
        self.rect.y += self.velocidad_y
        if self.rect.bottom > height:
            self.kill()                 


# Class Metior
class Meteoro(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.image.load("Resized_Meteoro.png").convert_alpha()
        self.rect = self.image.get_rect()
        self.rect.centerx = x
        self.velocidad_y = random.randrange(10, width)
        self.velocidad_y = 4


    def update(self):
        self.rect.y += self.velocidad_y
        if self.rect.bottom > height:
            self.kill()


# Explosion Class
class Explosion(pygame.sprite.Sprite):
    def __init__(self, position):
        super().__init__()
        self.image = explosion_list[0]
        img_scala = pygame.transform.scale(self.image, (20, 20))
        self.rect = img_scala.get_rect()
        self.rect.center = position
        self.time = pygame.time.get_ticks()
        self.velocidad_explo = 30
        self.frames = 0

    def update(self):
        tiempo = pygame.time.get_ticks()
        if tiempo - self.time > self.velocidad_explo:
            self.time = tiempo
            self.frames += 1
            if self.frames == len(explosion_list):
                self.kill()
            else:
                position = self.rect.center
                self.image = explosion_list[self.frames]
                self.rect = self.image.get_rect()
                self.rect.center = position



# Class Boss
Boss_list = []  # Definir la lista de imágenes fuera de la clase

class Boss(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        # Cargar las imágenes del jefe en la lista Boss_list
        for i in range(1, 7):
            image_path = os.path.join("Boss", f"{i}.png")
            Bossx = pygame.image.load(image_path).convert_alpha()
            Boss_list.append(pygame.transform.scale(Bossx, (500, 500)))

        self.image_index = 0
        self.image = Boss_list[self.image_index]
        self.rect = self.image.get_rect()
        self.rect.right = width  # Colocar el jefe en el lado derecho de la pantalla
        self.rect.bottom = height  # Colocar el jefe en la parte inferior de la pantalla
        self.health = 1500  # Boss's health points
        self.velocidad_x = 2  # Velocidad horizontal
        self.velocidad_y = 1  # Velocidad vertical inicial
        self.direction_x = -1  # Dirección horizontal inicial del movimiento (1 = hacia la derecha, -1 = hacia la izquierda)
        self.direction_y = -1  # Dirección vertical inicial del movimiento (-1 = hacia arriba, 1 = hacia abajo)
        self.intervalo_cambio_imagen = 100  # Ajustar la velocidad de la animación según sea necesario

        self.tiempo_cambio_imagen = pygame.time.get_ticks()

    def update(self):
        # Mover el jefe horizontalmente según su dirección actual
        self.rect.x += self.velocidad_x * self.direction_x

        # Cambiar la dirección horizontal si toca los límites de la pantalla
        if self.rect.left <= 0 and self.direction_x == -1:
            self.direction_x = 1
        if self.rect.right >= width and self.direction_x == 1:
            self.direction_x = -1

        # Mover el jefe verticalmente según su dirección actual
        self.rect.y += self.velocidad_y * self.direction_y

        # Cambiar la dirección vertical si toca los límites de la pantalla
        if self.rect.top <= 0 and self.direction_y == -1:
            self.direction_y = 1
        if self.rect.bottom >= height and self.direction_y == 1:
            self.direction_y = -1

        # Controlar el cambio de imagen a una velocidad más lenta
        tiempo_actual = pygame.time.get_ticks()
        if tiempo_actual - self.tiempo_cambio_imagen >= self.intervalo_cambio_imagen:
            self.image_index = (self.image_index + 1) % len(Boss_list)
            self.image = Boss_list[self.image_index]
            self.tiempo_cambio_imagen = tiempo_actual

        self.draw_health_bar(screen)


    def hit(self, damage):
        # Reduce the boss's health by the specified damage
        self.health -= damage
        if self.health <= 0:
            self.kill()  # Remove the boss if its health reaches zero
            grupo_enemigos.remove(self)  # Remove the boss from the enemy group
            grupo_jugador.remove(self) 

    def draw_health_bar(self, surface):
    # Draw the boss's health bar on the screen
        bar_width = 200
        bar_height = 20
        fill = int((self.health / 500) * bar_width)
        fill = min(bar_width, max(0, fill))  # Ensure fill is within the valid range
    
    # Use the boss's rect to determine the position of the health bar
        bar_x = self.rect.centerx - bar_width // 2
        bar_y = self.rect.top - 30
    
        border = pygame.Rect(bar_x, bar_y, bar_width, bar_height)
        fill = pygame.Rect(bar_x, bar_y, fill, bar_height)
        pygame.draw.rect(surface, (255, 0, 0), fill)
        pygame.draw.rect(surface, (255, 255, 255), border, 2)
        


#------------------------------------------------------------------------------------
            


#"Groups"

grupo_jugador = pygame.sprite.Group()
grupo_enemigos = pygame.sprite.Group()
grupo_balas_ = pygame.sprite.Group()
grupo_balas_jugador = pygame.sprite.Group()
grupo_balas_enemigos = pygame.sprite.Group()
grupo_enemigos2 = pygame.sprite.Group()
grupo_boss = pygame.sprite.Group() 


# Player
player = Jugador()
grupo_jugador.add(player)
grupo_balas_jugador.add(player)

for x in range(5): 
    enemigo = Enemigos(1, 5)
    grupo_enemigos.add(enemigo)
    grupo_jugador.add(enemigo )



current_background = fondo1

tiempo_ultimo_enemigo = pygame.time.get_ticks()
INTERVALO_CREACION_ENEMIGOS = 1000

MAX_ENEMIGOS_EN_PANTALLA = 7

boss_spawned = False
boss = None


# Main Buckle
while run:
    clock.tick(fps)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            run = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                player.disparar()
            elif event.key == pygame.K_RETURN:  # Check for the 'Enter' key to pause/unpause the game
                game_paused = not game_paused
        if transicion_alpha > 0:
            transicion_alpha -= 3 
    # Mueve los fondos hacia abajo

    if game_paused:
        pause_game()
        continue
    fondo1_y += background_speed
    fondo2_y += background_speed
    fondo3_y += background_speed
    fondo4_y += background_speed
    

    # Cambio de fondo
    if fondo1_y >= height:
        fondo1_y = -fondo1.get_height()
        current_background = fondo2
        transicion_alpha = 255  # Reinicia la transición al cambiar de fondo

    if fondo2_y >= height:
        fondo2_y = -fondo2.get_height()
        current_background = fondo1
        transicion_alpha = 255  # Reinicia la transición al cambiar de fondo

    # Decrementar la opacidad gradualmente
    if transicion_alpha > 0:
        transicion_alpha -= 3     

    screen.blit(fondo1, (0, fondo1_y))
    screen.blit(fondo2, (0, fondo2_y))
    screen.blit(fondo3, (0, fondo3_y))
    screen.blit(fondo4, (0, fondo4_y))

    draw_transition(transicion_alpha)

    grupo_jugador.update()
    grupo_enemigos.update()
    grupo_enemigos2.update()
    grupo_balas_jugador.update()
    grupo_balas_enemigos.update()
    grupo_boss.update()
    
   
    
    grupo_jugador.draw(screen)
    tiempo_actual = pygame.time.get_ticks()

    if len(grupo_enemigos.sprites()) < MAX_ENEMIGOS_EN_PANTALLA and tiempo_actual - tiempo_ultimo_enemigo >= INTERVALO_CREACION_ENEMIGOS:
        enemigo = Enemigos(1, 7)  # Puedes ajustar las coordenadas iniciales según tus necesidades
        grupo_enemigos.add(enemigo)
        grupo_jugador.add(enemigo)
        
        tiempo_ultimo_enemigo = tiempo_actual

    if score >= 2100 and not boss_spawned:
        # Si el score llega a 500 y el boss aún no ha aparecido, crea el boss y agrégalo a los grupos
        boss = Boss()
        grupo_boss.add(boss)
        grupo_jugador.add(boss)
        boss_spawned = True     

    if boss_spawned and boss in grupo_boss.sprites():
        boss.update()
        boss.draw_health_bar(screen)

        colision3 = pygame.sprite.spritecollide(boss, grupo_balas_jugador, True)
        for bullet in colision3:
            boss.hit(20)  # Each bullet from the boss reduces the boss's health by 20
            explo2 = Explosion(bullet.rect.center)  # Create an explosion at the bullet's position
            grupo_jugador.add(explo2)

        # If the boss's health reaches zero, remove it from the sprite groups
        if boss.health <= 0:
            
            grupo_boss.remove(boss)
            grupo_jugador.remove(boss)
            
            boss = None

    colision1 = pygame.sprite.groupcollide(grupo_enemigos, grupo_balas_jugador, True, True)
    for i in colision1:
        score += 10

        if 200 <= score <= 600  and not grupo_enemigos2.sprites():
            
                enemigo2 = Enemigos2()
                grupo_enemigos.add(enemigo2)
                grupo_jugador.add(enemigo2)

        if 600 <= score <= 1200  :
            
                enemigo = Enemigos(1,1)
                grupo_enemigos.add(enemigo)
                grupo_jugador.add(enemigo)


        if  1200 <= score <= 1800  and not grupo_enemigos2.sprites(): 
            
                enemigo2 = Enemigos2()
                grupo_enemigos.add(enemigo2)
                grupo_jugador.add(enemigo2)      


        if score >= 2000:
           score_reached_2000 = True        

       

        if  score > 2200  :
            
                enemigo = Enemigos(1,1)
                grupo_enemigos.add(enemigo)
                grupo_jugador.add(enemigo)

   

#------------------------------------------------------------------
        # Si el score suma 200 da vida.
        if score == 200:
            player.vida += 20   
        enemigo.disparar_enemigos() 
        enemigo = Enemigos(1, 10)
        

        explo = Explosion(i.rect.center)
        grupo_jugador.add(explo) 
        explosion_sonido.set_volume(0.3)
        explosion_sonido.play()
#---------------------------------------------------------------------------
    colision2 = pygame.sprite.spritecollide(player, grupo_balas_enemigos, True)
    for j in colision2:
        player.vida -= 10
        if player.vida <= 0 or player not in grupo_jugador.sprites():
            run = False
        explo1 = Explosion(j.rect.center)
        grupo_jugador.add(explo1)
        golpe_sonido.play()


    hits = pygame.sprite.spritecollide(player, grupo_enemigos, False)
    for hit in hits:  
        player.vida -= 100
        if player.vida <= 0  or player not in grupo_jugador.sprites():
           run = False
        golpe_sonido.play()
        #enemigos = Enemigos(1, 1)
        #grupo_jugador.add(enemigos)
        #grupo_enemigos.add(enemigos)

    hits = pygame.sprite.spritecollide(player, grupo_enemigos2, False)
    for hit in hits:  
        player.vida -= 100    
        if player.vida <= 0 or player not in grupo_jugador.sprites():
            run = False

        explo1 = Explosion(j.rect.center)
        grupo_jugador.add(explo1)
        golpe_sonido.play()    
    

   
    texto_puntuacion(screen, (" SCORE: " + str(score) + "     "), 30, width - 85, 2)

    barra_vida(screen, width - 285, 0, player.vida)

    if player.vida <= 0 or player not in grupo_jugador.sprites():
        run = False
        show_game_over_screen()

    pygame.display.flip()

