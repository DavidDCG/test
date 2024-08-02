const uuid = require('uuid');
require('dotenv').config();

const POSITRACE_CONFIG = {
    api_url_root: process.env.API_URL_ROOT,
    application_key: process.env.APLICATION_KEY, /* Cambia a tu clave de aplicación */
    email: process.env.EMAIL, /* Cambia a tu correo electrónico de usuario */
    password: process.env.PASSWORD, /* Cambia a tu contraseña de usuario */
    //account_id: 23381
};

DatosConexion = async (token, cuenta) => {
    try {
        if (token) {

            POSITRACE_CONFIG.session_token = token;
            POSITRACE_CONFIG.tokensExistentes = [{ name: cuenta, token: token }]
            POSITRACE_CONFIG.valid = true;
            POSITRACE_CONFIG.Message = "Conexión correcta."

        } else {

            const axios = require('axios');
            let UUID = uuid.v4();
            const response = await axios.post(`${POSITRACE_CONFIG.api_url_root}/api_devices`, {
                title: UUID,
                application_key: POSITRACE_CONFIG.application_key
            });

            let device_token = response.data.api_device.token;
            //
            const ResponseUserToken = await axios.post(`${POSITRACE_CONFIG.api_url_root}/users/sign_in`, {
                email: POSITRACE_CONFIG.email,
                password: POSITRACE_CONFIG.password,
                token: device_token
            });

            let userToken = ResponseUserToken.data.user.token;
            //
            const responseRequestSessionToken = await axios.get(`${POSITRACE_CONFIG.api_url_root}/accounts`, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                params: {
                    token: userToken
                }
            });

            let account;
            account = responseRequestSessionToken.data.accounts[0];
            let session_token = account && account.token;

            const tokensExistentesExistentes = responseRequestSessionToken.data.accounts.map(account => ({
                id: account.id,
                name: account.name,
                token: account.token
            }));

            POSITRACE_CONFIG.session_token = session_token;

            POSITRACE_CONFIG.tokensExistentes = tokensExistentesExistentes;
            POSITRACE_CONFIG.valid = true;
            POSITRACE_CONFIG.Message = "Conexión correcta."
        }

        return POSITRACE_CONFIG

    } catch (error) {

        POSITRACE_CONFIG.valid = false;
        POSITRACE_CONFIG.message = "Error al conectar a Positrace. " + error

        return POSITRACE_CONFIG;
    }
};

module.exports = { DatosConexion }


