const express = require('express')
const router = express.Router()
const aiAnalysisController = require('../controllers/aiAnalysis')

router.post('/ai-analyses', aiAnalysisController.saveAnalysis)
router.get('/ai-analyses', aiAnalysisController.getAnalyses)
router.delete('/ai-analyses/:id', aiAnalysisController.deleteAnalysis)

module.exports = router 