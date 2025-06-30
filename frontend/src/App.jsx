import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [tree, setTree] = useState(null);
  const [mode, setMode] = useState("compress");
  const [loading, setLoading] = useState(false);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);

  const downloadFile = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadByLink = async (fileName, callback) => {
    try {
      const res = await fetch(`http://localhost:5000/download/${fileName}`);
      const blob = await res.blob();
      if (callback) callback(blob);
      downloadFile(blob, fileName);
    } catch (error) {
      alert("Download failed: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    if (mode === "compress") {
      formData.append("file", file);
      setOriginalSize((file.size / 1024).toFixed(2));

      const res = await fetch("http://localhost:5000/compress", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("Compression failed: " + (await res.text()));
        setLoading(false);
        return;
      }

      const { binFile, treeFile } = await res.json();

      downloadByLink(binFile, (blob) => {
        setCompressedSize((blob.size / 1024).toFixed(2));
      });
      downloadByLink(treeFile);
    } else {
      formData.append("bin", file);
      formData.append("tree", tree);

      const res = await fetch("http://localhost:5000/decompress", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("Decompression failed: " + (await res.text()));
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      downloadFile(blob, "output.txt");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>📦 Huffman File Compressor</h1>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Mode:
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setTree(null);
              setFile(null);
              setOriginalSize(null);
              setCompressedSize(null);
            }}
          >
            <option value="compress">Compress</option>
            <option value="decompress">Decompress</option>
          </select>
        </label>

        <label>
          Upload {mode === "compress" ? "Text" : "Binary"} File:
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </label>

        {mode === "decompress" && (
          <label>
            Upload Tree File:
            <input
              type="file"
              onChange={(e) => setTree(e.target.files[0])}
              required
            />
          </label>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {originalSize && compressedSize && (
        <div className="result">
          <p>📄 Original Size: {originalSize} KB</p>
          <p>📦 Compressed Size: {compressedSize} KB</p>
          <p>🧮 Compression Ratio: {((compressedSize / originalSize) * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}

export default App;