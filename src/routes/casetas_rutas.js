
const { Router } = require ('express');
const router = Router();
const { CasetasRutas } = require ('../controller/casetas_rutasController.js');

router.post("/casetas_rutas", CasetasRutas);


module.exports = router;