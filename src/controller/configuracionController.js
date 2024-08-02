const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../../config/firebase-config');
const path = require('path');
const Validator = require('validatorjs');

async function removeImageBackground(req = request, res = response) {
    try {
        const ruta_destino_firebase = "Halconet/Firmas/";
        const guid = uuidv4();
        
        // Definir las reglas de validación
        const rules = {
            url_img: 'required|string'
        };
        
        // Crear una nueva instancia de Validator
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            throw new Error('Validation Error: ' + JSON.stringify(validation.errors.all()));
        }

        const url_get = req.body.url_img;

        // Establecer un timeout para la operación de eliminación de fondo
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: La operación tomó demasiado tiempo')), 30000); // 30 segundos
        });

        // Ejecutar la operación de eliminación de fondo con timeout
        const blob = await Promise.race([removeBackground(url_get), timeoutPromise]);
        
        const buffer = Buffer.from(await blob.arrayBuffer());
        
        // Referencia al archivo en Firebase Storage
        const file = bucket.file(ruta_destino_firebase + guid + ".png");
        await file.save(buffer, {
            metadata: {
                contentType: "image/png",
            },
        });

        // Obtener la URL pública con el token de acceso
        const [publicUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
        });

        res.json({
            valid: true,
            message: "Transacción válida, imagen subida exitosamente a",
            data: {
                nombre: guid + ".png",
                ruta_publica: publicUrl,
                ruta_firebase: ruta_destino_firebase
            }
        });

    } catch (error) {
        console.error('Error:', error); // Registrar el error
        res.status(400).json({
            valid: false,
            message: "Transacción no válida",
            data: { error: error.message }
        });
    }
}

module.exports = { removeImageBackground };

