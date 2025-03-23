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
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Plus icon
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Back arrow icon
import EditIcon from '@mui/icons-material/Edit'; // Edit icon
import DeleteIcon from '@mui/icons-material/Delete'; // Delete icon

function Assessments() {
  const theme = useTheme(); // Get the current theme

  // Dummy data for classes
  const classes = [
    { time: '9:00 AM - 10:00 AM', className: 'CSE-A', room: '201', date: '2023-10-01' },
    { time: '10:00 AM - 11:00 AM', className: 'DS-A', room: '204', date: '2023-10-01' },
    { time: '11:00 AM - 12:00 PM', className: 'Math-B', room: '202', date: '2023-10-01' },
  ];

  // State to manage the selected class
  const [selectedClass, setSelectedClass] = useState(null);

  // State to manage the popup for adding/editing assessments
  const [openPopup, setOpenPopup] = useState(false);

  // State to manage the new assessment form
  const [assessmentName, setAssessmentName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('quiz');
  const [isGraded, setIsGraded] = useState(false);

  // State to manage assessments for the selected class
  const [assessments, setAssessments] = useState([]);

  // State to manage the assessment being edited
  const [editingAssessment, setEditingAssessment] = useState(null);

  // Function to handle card click
  const handleCardClick = (classData) => {
    setSelectedClass(classData);
  };

  // Function to handle back button click
  const handleBackClick = () => {
    setSelectedClass(null);
  };

  // Function to handle the plus button click
  const handleAddAssessment = () => {
    setEditingAssessment(null); // Reset editing state
    setOpenPopup(true);
  };

  // Function to handle popup close
  const handlePopupClose = () => {
    setOpenPopup(false);
    // Reset form fields
    setAssessmentName('');
    setDate('');
    setTime('');
    setType('quiz');
    setIsGraded(false);
  };

  // Function to handle form submission (Create/Update)
  const handleSubmit = () => {
    if (editingAssessment) {
      // Update existing assessment
      const updatedAssessments = assessments.map((assessment) =>
        assessment.id === editingAssessment.id
          ? {
              ...assessment,
              name: assessmentName,
              date: date,
              time: time,
              type: type,
              isGraded: isGraded,
            }
          : assessment
      );
      setAssessments(updatedAssessments);
    } else {
      // Add new assessment
      const newAssessment = {
        id: assessments.length + 1,
        name: assessmentName,
        date: date,
        time: time,
        type: type,
        isGraded: isGraded,
      };
      setAssessments([...assessments, newAssessment]);
    }
    handlePopupClose();
  };

  // Function to handle edit button click
  const handleEditAssessment = (assessment) => {
    setEditingAssessment(assessment);
    setAssessmentName(assessment.name);
    setDate(assessment.date);
    setTime(assessment.time);
    setType(assessment.type);
    setIsGraded(assessment.isGraded);
    setOpenPopup(true);
  };

  // Function to handle delete button click
  const handleDeleteAssessment = (assessmentId) => {
    const updatedAssessments = assessments.filter(
      (assessment) => assessment.id !== assessmentId
    );
    setAssessments(updatedAssessments);
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
      <h2 style={{ textAlign: 'center', color: theme.palette.text.primary }}>Assessments Page</h2>

      {/* Render cards or assessments list based on selectedClass */}
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
        // Render assessments list for the selected class
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

          {/* Plus button to add assessments */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddAssessment}
            style={{ marginBottom: '20px' }}
          >
            Add Assessment
          </Button>

          {/* Assessments list */}
          <Box>
            {assessments.map((assessment) => (
              <Card key={assessment.id} style={{ marginBottom: '10px' }}>
                <CardContent>
                  <Typography variant="h6" color={theme.palette.text.primary}>
                    {assessment.name}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.text.secondary}>
                    Date: {assessment.date}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.text.secondary}>
                    Time: {assessment.time}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.text.secondary}>
                    Type: {assessment.type}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.text.secondary}>
                    Graded: {assessment.isGraded ? 'Yes' : 'No'}
                  </Typography>
                  <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <IconButton
                      onClick={() => handleEditAssessment(assessment)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </div>
      )}

      {/* Popup for adding/editing assessments */}
      <Dialog open={openPopup} onClose={handlePopupClose}>
        <DialogTitle>
          {editingAssessment ? 'Edit Assessment' : 'Add New Assessment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Assessment Name"
            fullWidth
            value={assessmentName}
            onChange={(e) => setAssessmentName(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <TextField
            label="Date"
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <TextField
            label="Time"
            fullWidth
            type="time"
            InputLabelProps={{ shrink: true }}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <FormLabel component="legend">Type</FormLabel>
          <RadioGroup
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ marginBottom: '20px' }}
          >
            <FormControlLabel value="quiz" control={<Radio />} label="Quiz" />
            <FormControlLabel value="exam" control={<Radio />} label="Exam" />
            <FormControlLabel value="assignment" control={<Radio />} label="Assignment" />
          </RadioGroup>
          <FormControlLabel
            control={
              <Switch
                checked={isGraded}
                onChange={(e) => setIsGraded(e.target.checked)}
              />
            }
            label="Graded"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePopupClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {editingAssessment ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Assessments;