import pygame
import random
from PIL import Image
image = Image.open('imagenes/Nave.png')
new_width = 120
new_height = 120
resized_image = image.resize((new_width, new_height))
resized_image.save("Resized_Nave.png")   

image2 = Image.open('imagenes/bala2.png')
new_width = 120
new_height = 120
resized_image2 = image2.resize((new_width, new_height))  
resized_image2.save("Resized_bala.png")

image3 = Image.open('imagenes/espace.jpg')
new_width = 1800
new_height = 900
resized_image3 = image3.resize((new_width, new_height))
resized_image3.save('resized_Space.jpg')
game_over = False


pygame.init()
pygame.mixer.init() 
fondo = pygame.image.load('resized_Space.jpg')
laser_sonido = pygame.mixer.Sound('laser.wav')
explosion_sonido = pygame.mixer.Sound('explosion.wav')
golpe_sonido = pygame.mixer.Sound('golpe.wav') 

explosion_list = []
for i in range(1,13):
    explosion = pygame.image.load(f'explosion/{i}.png')
    explosion_list.append(explosion)

width = fondo.get_width()
height = fondo.get_height()
window = pygame.display.set_mode((width, height))
pygame.display.set_caption('Juego Space Invaders')
run = True
fps = 60
clock = pygame.time.Clock()
score = 0
vida = 100
blanco = (255,255,255)
negro = (0,0,0)

def texto_puntuacion(frame, text, size, x,y):
    font = pygame.font.SysFont('Small Fonts', size, bold=True)
    text_frame = font.render(text,True, blanco,negro)
    text_rect = text_frame.get_rect()
    text_rect.midtop = (x,y)
    frame.blit(text_frame, text_rect)

def barra_vida(frame, x,y, nivel):
        longitud = 100
        alto = 20
        fill = int((nivel/100)*longitud)
        border = pygame.Rect(x,y, longitud, alto)
        fill = pygame.Rect(x,y,fill,alto)
        pygame.draw.rect(frame, (255,0,55),fill)  
        pygame.draw.rect(frame, negro, border, 4)

def show_game_over_screen():
    # Clear the screen
    window.fill((0, 0, 0))
    
    # Display the game over message
    font = pygame.font.SysFont('Arial', 50)
    text_surface = font.render('Game Over', True, (255, 255, 255))
    text_rect = text_surface.get_rect()
    text_rect.center = (width // 2, height // 2)
    window.blit(text_surface, text_rect)
    
    # Update the display
    pygame.display.flip()
    pygame.time.delay(5000)



class Jugador(pygame.sprite.Sprite):
        
    def __init__(self):
        super().__init__()
        self.image = pygame.image.load('Resized_Nave.png').convert_alpha()
        pygame.display.set_icon(self.image)
        self.rect = self.image.get_rect()
        self.rect.centerx = width // 2
        self.rect.centery = height - 100
        self.velocidad_x = 0
        self.velocidad_y = 0  # Added vertical velocity
        self.vida = 100

    def update(self):
        self.velocidad_x = 0
        self.velocidad_y = 0  # Reset vertical velocity

        keystate = pygame.key.get_pressed()
        if keystate[pygame.K_LEFT]:
            self.velocidad_x = -5
        elif keystate[pygame.K_RIGHT]:
            self.velocidad_x = 5
        if keystate[pygame.K_UP]:  # Move up
            self.velocidad_y = -5
        elif keystate[pygame.K_DOWN]:  # Move down
            self.velocidad_y = 5

        self.rect.x += self.velocidad_x
        self.rect.y += self.velocidad_y  # Update vertical position

        if self.rect.right > width:
            self.rect.right = width
        elif self.rect.left < 0:
            self.rect.left = 0
        if self.rect.bottom > height:  # Keep the player within the screen vertically
            self.rect.bottom = height
        elif self.rect.top < 0:
            self.rect.top = 0
    
    def disparar(self):
            bala = Balas(self.rect.centerx, self.rect.top)
            grupo_jugador.add(bala)
            grupo_balas_jugador.add(bala)
            laser_sonido.play()

class Enemigos(pygame.sprite.Sprite): 
     def __init__(self, x, y): 
          super().__init__()
          image_path = 'imagenes/marciano.gif'
          gif = Image.open(image_path)
          resized_gif = gif.resize((120, 120))
          resized_gif.save('nuevonave.gif')

          self.image = pygame.image.load('nuevonave.gif').convert_alpha()
          self.rect = self.image.get_rect()
          self.rect.x = random.randrange(1, width-100)
          self.rect.y = 20
          self.velocidad_y = random.randrange(0,20)
          self.tiempo_disparo =pygame.time.get_ticks()


     def update(self):
            self.time = random.randrange(-1, pygame.time.get_ticks()//5000)
            self.rect.x += self.time
            if self.rect.x  >= width:
               self.rect.x = 0
               self.rect.y += 150

            tiempo_actual = pygame.time.get_ticks()
            tiempo_transcurrido = tiempo_actual - self.tiempo_disparo
            intervalo_disparo = 4000 

            if tiempo_transcurrido >= intervalo_disparo:
               self.disparar_enemigos()
               self.tiempo_disparo = tiempo_actual       
                   
 
     def disparar_enemigos(self):
          bala = Balas_enemigos(self.rect.centerx, self.rect.bottom)
          grupo_jugador.add(bala)
          grupo_balas_enemigos.add(bala)
          laser_sonido.play()     

class Balas(pygame.sprite.Sprite):
     def __init__(self, x, y):
          super().__init__()
          self.image = pygame.image.load('imagenes/B2.png').convert_alpha()
          self.rect = self.image.get_rect()
          self.rect.centerx = x
          self.rect.y = y
          self.velocidad = -18

     def update(self):
          self.rect.y += self.velocidad
          if self.rect.bottom <0:
               self.kill()

class Balas_enemigos(pygame.sprite.Sprite):
     def __init__(self, x, y):
          super(). __init__()
          self.image = pygame.image.load('Resized_bala.png').convert_alpha()
          self.image = pygame.transform.rotate(self.image, 180)
          self.rect = self.image.get_rect()
          self.rect.centerx = x
          
          self.velocidad_y = 4  

     def update(self): 
          self.rect.y += self.velocidad_y
          if self.rect.bottom > height:
               self.kill()


class Explosion(pygame.sprite.Sprite):
     def __init__(self, position):
          super().__init__()
          self.image = explosion_list[0]
          img_scala = pygame.transform.scale(self.image, (20,20)) 
          self.rect = img_scala.get_rect()
          self.rect.center = position
          self.time = pygame.time.get_ticks()
          self.velocidad_explo = 30
          self.frames = 0

     def update(self):
          tiempo = pygame.time.get_ticks()
          if tiempo - self.time > self.velocidad_explo:
               self.time = tiempo
               self.frames+=1
               if self.frames == len(explosion_list):
                    self.kill()
               else:
                    position = self.rect.center
                    self.image = explosion_list[self.frames]
                    self.rect = self.image.get_rect()
                    self.rect.center = position

grupo_jugador = pygame.sprite.Group()
grupo_enemigos = pygame.sprite.Group()
grupo_balas_ = pygame.sprite.Group()
grupo_balas_jugador = pygame.sprite.Group()
grupo_balas_enemigos = pygame.sprite.Group()     

player = Jugador()
grupo_jugador.add(player)
grupo_balas_jugador.add(player)

for x in range(20):
     enemigo = Enemigos(10,10)
     grupo_enemigos.add(enemigo)
     grupo_jugador.add(enemigo)

while run:
     clock.tick(fps)
     window.blit(fondo,(0,0))  

     for event in pygame.event.get():
          if event.type == pygame.QUIT:  
               run = False
          elif event.type == pygame.KEYDOWN:
               if event.key == pygame.K_SPACE:
                    player.disparar()

     grupo_jugador.update()
     grupo_enemigos.update()
     grupo_balas_jugador.update()
     grupo_balas_enemigos.update()

     grupo_jugador.draw(window)

     colision1 = pygame.sprite.groupcollide(grupo_enemigos, grupo_balas_jugador, True, True)
     for i in colision1:
          score+=10
          enemigo.disparar_enemigos()
          enemigo = Enemigos(300,10)
          grupo_enemigos.add(enemigo)
          grupo_jugador.add(enemigo)

          explo = Explosion(i.rect.center)
          grupo_jugador.add(explo)
          explosion_sonido.set_volume(0.3)
          explosion_sonido.play()

     colision2 = pygame.sprite.spritecollide(player,grupo_balas_enemigos, True)
     for j in colision2:
          player.vida  -= 10
          if player.vida <=0:
               run = False
               explo1 = Explosion(j.rect.center)
               grupo_jugador.add(explo1)
               golpe_sonido.play()

     hits = pygame.sprite.spritecollide(player, grupo_enemigos, False) 
     for hit in hits:
          player.vida -= 100
          enemigos = Enemigos(10,10)
          grupo_jugador.add(enemigos)
          grupo_enemigos.add(enemigos)
          if player.vida <= 0:
               run = False

               
     texto_puntuacion(window, (' SCORE: ' + str(score)+'     '), 30, width-85, 2)         
     
     barra_vida(window, width-285, 0, player.vida)

     if player.vida <= 0:
          run = False
          show_game_over_screen()



     
     pygame.display.flip()
pygame.quit()     
  
 









                        






                    
                    
               
                    






          
                    



                    



               






                  


     
     




    
