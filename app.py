from flask import Flask, render_template, Response
import Space  # Importa tu código de Pygame

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def generate():
    for frame in Space.run_game():  # Reemplaza esto con la lógica de tu juego
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
