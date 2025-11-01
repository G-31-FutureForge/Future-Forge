import generateReportContent from '../services/reportGenerator.js';

export const generateReport = async (req, res) => {
  try {
    const { matched, missing, extra } = req.body;
    const report = await generateReportContent({ matched, missing, extra });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};