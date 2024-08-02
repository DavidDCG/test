
const { Router } = require ('express');
const router = Router();
const { CasetasRutas } = require ('../controller/CasetasRutasController.js');

router.post("/CasetasRutas", CasetasRutas);


module.exports = router;