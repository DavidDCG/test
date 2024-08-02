
const { Router } = require ('express');
const router = Router();
const { Obtener_state_trips } = require ('../controller/state_tripsController');

router.get("/state_trips", Obtener_state_trips);

module.exports = router;