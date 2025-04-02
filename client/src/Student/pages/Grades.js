import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  LinearProgress,
  Box
} from '@mui/material';

const Grades = () => {
  // Sample grades data
  const gradesData = [
    { subject: 'Mathematics', grade: 'A', progress: 90 },
    { subject: 'Science', grade: 'B+', progress: 85 },
    { subject: 'English', grade: 'A-', progress: 88 },
    { subject: 'History', grade: 'B', progress: 80 },
    { subject: 'Computer Science', grade: 'A', progress: 95 },
  ];

  // Calculate overall average
  const averageGrade = gradesData.reduce((acc, curr) => acc + curr.progress, 0) / gradesData.length;

  return (
    <div>
      <Typography variant="h4" gutterBottom>Grades</Typography>
      
      <Typography variant="h6" gutterBottom>
        Overall Average: {averageGrade.toFixed(1)}% (GPA: {getGPA(averageGrade)})
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gradesData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.subject}</TableCell>
                <TableCell>{row.grade}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                      <LinearProgress variant="determinate" value={row.progress} />
                    </Box>
                    <Box minWidth={35}>
                      <Typography variant="body2" color="textSecondary">{row.progress}%</Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

// Helper function to convert percentage to GPA
function getGPA(percentage) {
  if (percentage >= 90) return '4.0';
  if (percentage >= 85) return '3.7';
  if (percentage >= 80) return '3.3';
  if (percentage >= 75) return '3.0';
  if (percentage >= 70) return '2.7';
  if (percentage >= 65) return '2.3';
  if (percentage >= 60) return '2.0';
  return '1.0';
}

export default Grades;