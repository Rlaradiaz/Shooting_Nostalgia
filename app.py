from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

# Define una ruta para los archivos estáticos (por ejemplo, las imágenes y sonidos del juego)
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# Ruta para renderizar el archivo HTML con el juego
@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run()
