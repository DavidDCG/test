const { Router } = require ('express');
const router = Router();
const { removeImageBackground } = require ('../controller/configuracionController.js');
router.post("/remove_background", removeImageBackground);
module.exports = router;