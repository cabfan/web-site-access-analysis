const express = require('express');
const router = express.Router();
const AnalysisController = require('../controllers/AnalysisController');

router.get('/history', AnalysisController.getHistory);
router.get('/:id', AnalysisController.getDetails);
router.delete('/:id', AnalysisController.delete);

module.exports = router; 