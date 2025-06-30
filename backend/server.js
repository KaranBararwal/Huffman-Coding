const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require("fs");

// Ensure uploads/ and outputs/ folders exist
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');


const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // saves as original filename
  }
});

const upload = multer({ storage });


app.get('/download/:filename', (req, res) => {
  const filePath = `outputs/${req.params.filename}`;
  res.download(filePath, (err) => {
    if (err) res.status(500).send("File not found.");
  });
});



app.post('/compress', upload.single('file'), (req, res) => {
  const inputPath = req.file.path;
  const name = req.body.filename || "output";

  const outputPath = `outputs/${name}.bin`;
  const treePath = `outputs/${name}_tree.txt`;

  console.log("📥 Input File:", inputPath);
  console.log("📤 Output Bin:", outputPath);
  console.log("🌲 Tree File:", treePath);

  exec(`huffman.exe compress ${inputPath} ${outputPath} ${treePath}`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Compression failed:", stderr);
      return res.status(500).json({ error: "Compression failed", detail: stderr });
    }

    console.log("✅ Compression done. Files generated.");
    res.json({
      binFile: `${name}.bin`,
      treeFile: `${name}_tree.txt`
    });
  });
});




app.post('/decompress', upload.fields([
  { name: 'bin' },
  { name: 'tree' }
]), (req, res) => {
  const binPath = req.files['bin'][0].path;
  const treePath = req.files['tree'][0].path;
  const outputPath = 'outputs/output.txt';

  console.log("📂 Decompressing:");
  console.log("   Binary file:", binPath);
  console.log("   Tree file:", treePath);
  console.log("   Output will be saved to:", outputPath);

  exec(`huffman.exe decompress ${binPath} ${outputPath} ${treePath}`, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Decompression failed:", stderr);
      return res.status(500).json({ error: "Decompression failed", detail: stderr });
    }

    console.log("✅ Decompression succeeded. Sending file.");
    res.download(outputPath, 'output.txt');
  });
});


app.listen(5000, () => console.log('🚀 Server running at http://localhost:5000'));
