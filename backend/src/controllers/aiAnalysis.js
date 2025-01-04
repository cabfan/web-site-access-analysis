const AIAnalysis = require('../models/aiAnalysis')

exports.saveAnalysis = async (req, res) => {
  try {
    console.log('Received analysis data:', req.body);
    
    // 验证必要字段
    const { serverIp, logDate, content } = req.body;
    
    if (!serverIp || !logDate || !content) {
      console.error('Missing required fields:', {
        serverIp: !!serverIp,
        logDate: !!logDate,
        content: !!content
      });
      
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['serverIp', 'logDate', 'content'],
        received: {
          serverIp: typeof serverIp,
          logDate: typeof logDate,
          content: typeof content,
          body: req.body
        }
      });
    }

    // 验证日期格式
    const dateValue = new Date(logDate);
    if (isNaN(dateValue.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format',
        received: logDate
      });
    }

    const analysis = await AIAnalysis.create({
      serverIp,
      logDate: dateValue.toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
      content
    })
    
    res.json(analysis)
  } catch (error) {
    console.error('Error in saveAnalysis:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

exports.getAnalyses = async (req, res) => {
  try {
    const { serverIp, logDate } = req.query

    const analyses = await AIAnalysis.findAll({ serverIp, logDate })
    
    res.json(analyses)
  } catch (error) {
    console.error('Error in getAnalyses:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.deleteAnalysis = async (req, res) => {
  try {
    await AIAnalysis.delete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
} 