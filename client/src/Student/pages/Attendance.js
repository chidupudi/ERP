import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography 
} from '@mui/material';

const Attendance = () => {
  // Sample attendance data
  const attendanceData = [
    { date: '2023-10-01', status: 'Present' },
    { date: '2023-10-02', status: 'Present' },
    { date: '2023-10-03', status: 'Absent' },
    { date: '2023-10-04', status: 'Present' },
    { date: '2023-10-05', status: 'Late' },
  ];

  // Calculate attendance summary
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter(item => item.status === 'Present').length;
  const attendancePercentage = Math.round((presentDays / totalDays) * 100);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Attendance</Typography>
      
      <Typography variant="h6" gutterBottom>
        Attendance Summary: {attendancePercentage}% ({presentDays}/{totalDays} days)
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Attendance;