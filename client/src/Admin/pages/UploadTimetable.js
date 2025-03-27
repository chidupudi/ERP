import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function UploadTimetable() {
  const [file, setFile] = useState(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files?.[0] || null;
    setFile(uploadedFile);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Upload Timetable</Typography>
      <Card>
        <CardContent>
          <Button 
            variant="contained" 
            component="label" 
            startIcon={<UploadFileIcon />}
            sx={{ mt: 2 }}
          >
            Upload JSON
            <input 
              type="file" 
              hidden 
              accept=".json" 
              onChange={handleFileUpload} 
            />
          </Button>
          {file && (
            <Typography sx={{ mt: 2 }}>
              Uploaded: {file.name}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}