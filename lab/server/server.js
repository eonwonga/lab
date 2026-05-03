import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const upload = multer();

// Config
const PORT = process.env.PORT || 4000;
app.use(cors());

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Emulate hs_resolve.php
// Expects multipart/form-data with fields: "trx-code" and "mac"
app.post('/endpoints/hs_resolve.php', upload.none(), (req, res) => {
  const trxCode = req.body['trx-code']?.toString().trim().toUpperCase() || '';
  const mac = req.body['mac']?.toString().trim().toUpperCase() || '';

  // Basic validation
  if (!trxCode || !/^[A-Z0-9]{10}$/.test(trxCode)) {
    return res.status(200).json({ response_type: 'error', message: 'Invalid or missing trx-code' });
  }
  if (!mac) {
    return res.status(200).json({ response_type: 'error', message: 'Missing mac' });
  }

  // Mock logic
  // If trxCode ends with 0-3 => processing, 4-6 => resolved unused, 7-8 => resolved used, 9 => not found
  const last = trxCode[trxCode.length - 1];
  if (['0','1','2','3'].includes(last)) {
    return res.status(200).json({
      response_type: 'processing',
      time_stamp: new Date().toISOString(),
      ConversationID: `AG_${Date.now()}`
    });
  }
  if (['4','5','6'].includes(last)) {
    return res.status(200).json({
      response_type: 'resolved',
      used: '0',
      mac,
      message: `Transaction was resolved on ${new Date().toLocaleString()}`
    });
  }
  if (['7','8'].includes(last)) {
    return res.status(200).json({
      response_type: 'resolved',
      used: '1',
      mac: 'AA:BB:CC:DD:EE:FF',
      message: `Transaction was resolved on ${new Date().toLocaleString()}`
    });
  }

  // default: not found
  return res.status(200).json({ response_type: 'error', message: 'Transaction does not exist' });
});

app.listen(PORT, () => {
  console.log(`Resolve backend listening on http://localhost:${PORT}`);
});


