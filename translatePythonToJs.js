const fs = require('fs');
const path = require('path');
const { runScript } = require('brython');

function translatePythonToJs() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Ingrese el código Python a traducir: ', (inputCode) => {
    try {
      // Crear un archivo temporal para ejecutar el código Python
      const tmpFile = path.join(__dirname, 'temp.py');
      fs.writeFileSync(tmpFile, inputCode, 'utf-8');

      // Ejecutar el código Python con Brython y obtener la salida
      const jsCode = runScript(tmpFile);

      // Mostrar el código JavaScript traducido
      console.log('\nCódigo JavaScript traducido:\n');
      console.log(jsCode);
    } catch (error) {
      console.error('Error al traducir el código Python:', error.message);
    } finally {
      // Eliminar el archivo temporal
      fs.unlinkSync(tmpFile);
    }

    rl.close();
  });
}

translatePythonToJs();
