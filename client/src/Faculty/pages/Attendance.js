import React, { useState } from 'react';
import {
  useTheme,
  styled,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Avatar,
  Button,
  Switch,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Back arrow icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Present icon
import CancelIcon from '@mui/icons-material/Cancel'; // Absent icon

function Attendance() {
  const theme = useTheme(); // Get the current theme

  // Dummy data for classes
  const classes = [
    { time: '9:00 AM - 10:00 AM', className: 'CSE-A', room: '201', date: '2023-10-01' },
    { time: '10:00 AM - 11:00 AM', className: 'DS-A', room: '204', date: '2023-10-01' },
    { time: '11:00 AM - 12:00 PM', className: 'Math-B', room: '202', date: '2023-10-01' },
  ];

  // Dummy data for students
  const students = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    present: false, // Initially, no student is marked as present or absent
  }));

  // State to manage the selected class
  const [selectedClass, setSelectedClass] = useState(null);

  // State to manage attendance for students
  const [attendance, setAttendance] = useState(students);

  // Function to handle card click
  const handleCardClick = (classData) => {
    setSelectedClass(classData);
  };

  // Function to handle back button click
  const handleBackClick = () => {
    setSelectedClass(null);
  };

  // Function to mark a student as present or absent
  const markAttendance = (studentId, isPresent) => {
    setAttendance((prevAttendance) =>
      prevAttendance.map((student) =>
        student.id === studentId ? { ...student, present: isPresent } : student
      )
    );
  };

  // Function to mark all students as present
  const markAllPresent = () => {
    setAttendance((prevAttendance) =>
      prevAttendance.map((student) => ({ ...student, present: true }))
    );
  };

  // Function to mark all students as absent
  const markAllAbsent = () => {
    setAttendance((prevAttendance) =>
      prevAttendance.map((student) => ({ ...student, present: false }))
    );
  };

  // Function to handle "Apply" button click
  const handleApply = () => {
    alert('Changes applied (not saved).');
  };

  // Function to handle "Apply & Save" button click
  const handleApplyAndSave = () => {
    alert('Changes applied and saved.');
  };

  // Styled components for dynamic theming
  const StyledCard = styled(Card)(({ theme }) => ({
    margin: '10px',
    cursor: 'pointer',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }));

  return (
    <div style={{ padding: '20px', backgroundColor: theme.palette.background.default }}>
      <h2 style={{ textAlign: 'center', color: theme.palette.text.primary }}>Attendance Page</h2>

      {/* Render cards or attendance list based on selectedClass */}
      {!selectedClass ? (
        // Render list of cards
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {classes.map((classData, index) => (
            <StyledCard key={index} onClick={() => handleCardClick(classData)}>
              <CardContent>
                <Typography variant="h6" color={theme.palette.text.primary}>
                  {classData.className}
                </Typography>
                <Typography variant="body1" color={theme.palette.text.secondary}>
                  Time: {classData.time}
                </Typography>
                <Typography variant="body1" color={theme.palette.text.secondary}>
                  Room: {classData.room}
                </Typography>
                <Typography variant="body1" color={theme.palette.text.secondary}>
                  Date: {classData.date}
                </Typography>
              </CardContent>
            </StyledCard>
          ))}
        </div>
      ) : (
        // Render attendance list for the selected class
        <div>
          {/* Back arrow */}
          <IconButton onClick={handleBackClick} style={{ marginBottom: '10px' }}>
            <ArrowBackIcon style={{ color: theme.palette.text.primary }} />
          </IconButton>

          {/* Class details */}
          <Typography variant="h4" color={theme.palette.text.primary} gutterBottom>
            {selectedClass.className}
          </Typography>
          <Typography variant="h6" color={theme.palette.text.secondary} gutterBottom>
            Time: {selectedClass.time}
          </Typography>

          {/* Mark All buttons */}
          <Box style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <Button variant="contained" color="success" onClick={markAllPresent}>
              Mark All Present
            </Button>
            <Button variant="contained" color="error" onClick={markAllAbsent}>
              Mark All Absent
            </Button>
          </Box>

          {/* Student list */}
          <Box>
            {attendance.map((student) => (
              <div
                key={student.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: theme.palette.background.default,
                  borderRadius: '4px',
                  transition: 'background-color 0.3s ease', // Smooth transition
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar style={{ marginRight: '10px' }}>
                    {student.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body1" color={theme.palette.text.primary}>
                    {student.name}
                  </Typography>
                </div>
                <div>
                  <Switch
                    checked={student.present}
                    onChange={(e) => markAttendance(student.id, e.target.checked)}
                    color="success"
                    sx={{
                      '& .MuiSwitch-thumb': {
                        backgroundColor: student.present ? theme.palette.success.main : theme.palette.error.main,
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: student.present ? theme.palette.success.light : theme.palette.error.light,
                      },
                    }}
                  />
                </div>
              </div>
            ))}
          </Box>

          {/* Apply and Apply & Save buttons */}
          <Box style={{ display: 'flex', gap: '10px', marginTop: '20px', alignItems: 'right' }}>
            <Button variant="contained" color="primary" onClick={handleApply}>
              Apply
            </Button>
            <Button variant="contained" color="secondary" onClick={handleApplyAndSave}>
              Apply & Save
            </Button>
          </Box>
        </div>
      )}
    </div>
  );
}

export default Attendance;