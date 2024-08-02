const { removeBackground } = require('@imgly/background-removal-node');
const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../../config/firebase-config');
const Validator = require('validatorjs');

function removeImageBackground(req, res) {
    console.log("1. Definición de variables");
    const ruta_destino_firebase = "Halconet/Firmas/";
    const guid = uuidv4();
    console.log("2. Definición de reglas");

    // Definir las reglas de validación
    const rules = {
        url_img: 'required|string'
    };
    console.log("3. Revisión de reglas");

    // Crear una nueva instancia de Validator
    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return res.status(400).json({
            valid: false,
            message: 'Validation Error: ' + JSON.stringify(validation.errors.all())
        });
    }

    const url_get = req.body.url_img;
    console.log("4. Procesamiento de la imagen");

    // Ejecutar la operación de eliminación de fondo
    removeBackground(url_get)
        .then(blob => {
            console.log("5. Conversión de blob de imagen a array");

            // Convertir el blob de imagen a buffer
            return blob.arrayBuffer().then(arrayBuffer => Buffer.from(arrayBuffer));
        })
        .then(buffer => {
            console.log("6. Almacenamiento en Firebase");

            // Referencia al archivo en Firebase Storage
            const file = bucket.file(ruta_destino_firebase + guid + ".png");

            // Guardar el buffer en Firebase Storage
            return file.save(buffer, {
                metadata: {
                    contentType: "image/png"
                }
            }).then(() => {
                // Obtener la URL pública
                return file.getSignedUrl({
                    action: 'read',
                    expires: '03-01-2500'
                });
            });
        })
        .then(([publicUrl]) => {
            console.log("7. Generación de URL para lectura");

            console.log("8. JSON final resultado ");
            res.json({
                valid: true,
                message: "Transacción válida, imagen subida exitosamente a",
                data: {
                    nombre: guid + ".png",
                    ruta_publica: publicUrl,
                    ruta_firebase: ruta_destino_firebase
                }
            });
        })
        .catch(error => {
            console.error('9. Generado Error:', error); // Registrar el error
            res.status(400).json({
                valid: false,
                message: "Transacción no válida",
                data: { error: error.message }
            });
        });
}

module.exports = { removeImageBackground };
