import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import main from '.';


const app = express();
app.use(cors())
app.use(express.json());
// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Store path of last uploaded file
let lastUploadedFilePath: string | null = null;

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}.pdf`;
    lastUploadedFilePath = filename; // Save the path
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Endpoint to receive the uploaded PDF
//@ts-ignore
app.post('/upload', upload.single('pdf'), (req,res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({ message: "PDF uploaded successfully!" });
});

// Endpoint to get the path of the last uploaded file
//@ts-ignore
app.post("/getResult", async(req, res) => {
    const query = req.body.query
  if (!lastUploadedFilePath) {
    return res.status(404).json({ error: "No file uploaded yet" });
  }
  const text= await main(path.resolve(`dist/uploads/${lastUploadedFilePath}`),query);
  
  res.json({respnse:text});
});

// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
