import React, { useState } from 'react';
import {
  useTheme,
  styled,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Back arrow icon
import ListIcon from '@mui/icons-material/List'; // List icon

function Grades() {
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
    assignmentMarks: 0,
    assessmentMarks: 0,
  }));

  // State to manage the selected class
  const [selectedClass, setSelectedClass] = useState(null);

  // State to manage the selected card (Assignments or Assessments)
  const [selectedCard, setSelectedCard] = useState(null);

  // State to manage marks for students
  const [marks, setMarks] = useState(students);

  // State to manage the student marks list dialog
  const [openMarksList, setOpenMarksList] = useState(false);

  // State to manage maximum marks for assignments and assessments
  const [maxMarks, setMaxMarks] = useState({ assignments: 20, assessments: 30 });

  // Function to handle card click
  const handleCardClick = (classData) => {
    setSelectedClass(classData);
  };

  // Function to handle back button click
  const handleBackClick = () => {
    setSelectedClass(null);
    setSelectedCard(null);
  };

  // Function to handle card selection (Assignments or Assessments)
  const handleCardSelection = (cardType) => {
    setSelectedCard(cardType);
  };

  // Function to handle marks change for a student
  const handleMarksChange = (studentId, value) => {
    // Ensure the value is a positive number
    const parsedValue = Math.max(0, parseInt(value, 10) || 0);
    setMarks((prevMarks) =>
      prevMarks.map((student) =>
        student.id === studentId
          ? {
              ...student,
              [selectedCard === 'assignments' ? 'assignmentMarks' : 'assessmentMarks']: parsedValue,
            }
          : student
      )
    );
  };

  // Function to handle save button click
  const handleSave = () => {
    alert('Marks saved (not submitted).');
  };

  // Function to handle save & submit button click
  const handleSaveAndSubmit = () => {
    alert('Marks saved and submitted.');
  };

  // Function to open the student marks list dialog
  const handleOpenMarksList = () => {
    setOpenMarksList(true);
  };

  // Function to close the student marks list dialog
  const handleCloseMarksList = () => {
    setOpenMarksList(false);
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
      <h2 style={{ textAlign: 'center', color: theme.palette.text.primary }}>Grades Page</h2>

      {/* Render cards or marks entry based on selectedClass */}
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
        // Render marks entry for the selected class
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

          {/* Student Marks List button */}
          <Button
            variant="contained"
            startIcon={<ListIcon />}
            onClick={handleOpenMarksList}
            style={{ marginBottom: '20px' }}
          >
            Student Marks List
          </Button>

          {/* Two cards for Assignments and Assessments */}
          {!selectedCard ? (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <StyledCard onClick={() => handleCardSelection('assignments')}>
                <CardContent>
                  <Typography variant="h6" color={theme.palette.text.primary}>
                    Assignments (Out of {maxMarks.assignments})
                  </Typography>
                </CardContent>
              </StyledCard>
              <StyledCard onClick={() => handleCardSelection('assessments')}>
                <CardContent>
                  <Typography variant="h6" color={theme.palette.text.primary}>
                    Assessments (Out of {maxMarks.assessments})
                  </Typography>
                </CardContent>
              </StyledCard>
            </div>
          ) : (
            // Render marks entry for students
            <div>
              <Typography variant="h6" color={theme.palette.text.primary} gutterBottom>
                Enter Marks for {selectedCard === 'assignments' ? 'Assignments' : 'Assessments'} (Out of {maxMarks[selectedCard]})
              </Typography>

              {/* Students in 3 cards per row */}
              <Grid container spacing={2}>
                {marks.map((student) => (
                  <Grid item xs={4} key={student.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="body1" color={theme.palette.text.primary}>
                          {student.name}
                        </Typography>
                        <TextField
                          type="number"
                          value={
                            selectedCard === 'assignments'
                              ? student.assignmentMarks
                              : student.assessmentMarks
                          }
                          onChange={(e) =>
                            handleMarksChange(student.id, e.target.value)
                          }
                          inputProps={{ min: 0, max: maxMarks[selectedCard] }}
                          style={{ width: '100%', marginTop: '10px' }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Save and Save & Submit buttons */}
              <Box style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="contained" color="secondary" onClick={handleSaveAndSubmit}>
                  Save & Submit
                </Button>
              </Box>
            </div>
          )}
        </div>
      )}

      {/* Dialog for Student Marks List */}
      <Dialog open={openMarksList} onClose={handleCloseMarksList} fullWidth maxWidth="md">
        <DialogTitle>Student Marks List</DialogTitle>
        <DialogContent>
          <List>
            {marks.map((student) => (
              <ListItem key={student.id}>
                <ListItemText
                  primary={student.name}
                  secondary={
                    <>
                      <Typography variant="body2" color={theme.palette.text.secondary}>
                        Assignments: {student.assignmentMarks}/{maxMarks.assignments}
                      </Typography>
                      <Typography variant="body2" color={theme.palette.text.secondary}>
                        Assessments: {student.assessmentMarks}/{maxMarks.assessments}
                      </Typography>
                    </>
                  }
                />
                <Typography variant="body1" color={theme.palette.text.primary}>
                  Total: {student.assignmentMarks + student.assessmentMarks}/
                  {maxMarks.assignments + maxMarks.assessments}
                </Typography>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMarksList} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Grades;