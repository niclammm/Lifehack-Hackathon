import React, { useState } from 'react';

const BACKEND_SERVER_URL = "http://127.0.0.1:5000"
function CSVUploader() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('csv_file', file);

    try {
      const response = await fetch(BACKEND_SERVER_URL + "/upload-csv", {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload CSV'}
      </button>
    </div>
  );
}

export default CSVUploader