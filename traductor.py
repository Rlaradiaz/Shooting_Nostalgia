import jiphy

# Función para traducir un archivo Python a JavaScript
def python_to_js(input_file, output_file):
    try:
        with open(input_file, 'r') as python_file:
            python_code = python_file.read()
        
        js_code = jiphy.to.javascript(python_code)

        with open(output_file, 'w') as js_file:
            js_file.write(js_code)

        print(f"El archivo '{input_file}' ha sido traducido a '{output_file}' con éxito.")
    except Exception as e:
        print(f"Se produjo un error: {str(e)}")

if __name__ == "__main__":
    input_file = input("Ingrese la ruta del archivo Python de entrada: ")
    output_file = input("Ingrese la ruta del archivo JavaScript de salida: ")

    python_to_js(input_file, output_file)

#C:\Users\RODRIGO\Desktop\translatePythonToJs.js
