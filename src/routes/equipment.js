
const { Router } = require ('express');
const router = Router();
const { Equipment } = require ('../controller/equipmentController');

router.get("/equipment", Equipment);

router.post("/equipment", Equipment);

module.exports = router;