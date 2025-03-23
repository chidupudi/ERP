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

function Assignments() {
  const theme = useTheme(); // Get the current theme

  // Dummy data for classes
  const classes = [
    { time: '9:00 AM - 10:00 AM', className: 'CSE-A', room: '201', date: '2023-10-01' },
    { time: '10:00 AM - 11:00 AM', className: 'DS-A', room: '204', date: '2023-10-01' },
    { time: '11:00 AM - 12:00 PM', className: 'Math-B', room: '202', date: '2023-10-01' },
  ];

  // State to manage the selected class
  const [selectedClass, setSelectedClass] = useState(null);

  // State to manage the popup for adding/editing assignments
  const [openPopup, setOpenPopup] = useState(false);

  // State to manage the new assignment form
  const [assignmentName, setAssignmentName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submissionTime, setSubmissionTime] = useState('');
  const [submissionType, setSubmissionType] = useState('online');
  const [isPaperless, setIsPaperless] = useState(false);

  // State to manage assignments for the selected class
  const [assignments, setAssignments] = useState([]);

  // State to manage the assignment being edited
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Function to handle card click
  const handleCardClick = (classData) => {
    setSelectedClass(classData);
  };

  // Function to handle back button click
  const handleBackClick = () => {
    setSelectedClass(null);
  };

  // Function to handle the plus button click
  const handleAddAssignment = () => {
    setEditingAssignment(null); // Reset editing state
    setOpenPopup(true);
  };

  // Function to handle popup close
  const handlePopupClose = () => {
    setOpenPopup(false);
    // Reset form fields
    setAssignmentName('');
    setDeadline('');
    setSubmissionTime('');
    setSubmissionType('online');
    setIsPaperless(false);
  };

  // Function to handle form submission (Create/Update)
  const handleSubmit = () => {
    if (editingAssignment) {
      // Update existing assignment
      const updatedAssignments = assignments.map((assignment) =>
        assignment.id === editingAssignment.id
          ? {
              ...assignment,
              name: assignmentName,
              deadline: deadline,
              submissionTime: submissionTime,
              submissionType: submissionType,
              isPaperless: isPaperless,
            }
          : assignment
      );
      setAssignments(updatedAssignments);
    } else {
      // Add new assignment
      const newAssignment = {
        id: assignments.length + 1,
        name: assignmentName,
        deadline: deadline,
        submissionTime: submissionTime,
        submissionType: submissionType,
        isPaperless: isPaperless,
      };
      setAssignments([...assignments, newAssignment]);
    }
    handlePopupClose();
  };

  // Function to handle edit button click
  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setAssignmentName(assignment.name);
    setDeadline(assignment.deadline);
    setSubmissionTime(assignment.submissionTime);
    setSubmissionType(assignment.submissionType);
    setIsPaperless(assignment.isPaperless);
    setOpenPopup(true);
  };

  // Function to handle delete button click
  const handleDeleteAssignment = (assignmentId) => {
    const updatedAssignments = assignments.filter(
      (assignment) => assignment.id !== assignmentId
    );
    setAssignments(updatedAssignments);
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
      <h2 style={{ textAlign: 'center', color: theme.palette.text.primary }}>Assignments Page</h2>

      {/* Render cards or assignments list based on selectedClass */}
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
        // Render assignments list for the selected class
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

          {/* Plus button to add assignments */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddAssignment}
            style={{ marginBottom: '20px' }}
          >
            Add Assignment
          </Button>

          {/* Assignments list */}
          <Box>
            {assignments.map((assignment) => (
              <Card key={assignment.id} style={{ marginBottom: '10px' }}>
                <CardContent>
                  <Typography variant="h6" color={theme.palette.text.primary}>
                    {assignment.name}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.text.secondary}>
                    Deadline: {assignment.deadline}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.text.secondary}>
                    Submission Time: {assignment.submissionTime}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.text.secondary}>
                    Submission Type: {assignment.submissionType}
                  </Typography>
                  <Typography variant="body1" color={theme.palette.text.secondary}>
                    Paperless: {assignment.isPaperless ? 'Yes' : 'No'}
                  </Typography>
                  <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <IconButton
                      onClick={() => handleEditAssignment(assignment)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteAssignment(assignment.id)}
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

      {/* Popup for adding/editing assignments */}
      <Dialog open={openPopup} onClose={handlePopupClose}>
        <DialogTitle>
          {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Assignment Name"
            fullWidth
            value={assignmentName}
            onChange={(e) => setAssignmentName(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <TextField
            label="Deadline"
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <TextField
            label="Submission Time"
            fullWidth
            type="time"
            InputLabelProps={{ shrink: true }}
            value={submissionTime}
            onChange={(e) => setSubmissionTime(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <FormLabel component="legend">Submission Type</FormLabel>
          <RadioGroup
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            style={{ marginBottom: '20px' }}
          >
            <FormControlLabel value="online" control={<Radio />} label="Online" />
            <FormControlLabel value="offline" control={<Radio />} label="Offline" />
          </RadioGroup>
          <FormControlLabel
            control={
              <Switch
                checked={isPaperless}
                onChange={(e) => setIsPaperless(e.target.checked)}
              />
            }
            label="Paperless"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePopupClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {editingAssignment ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Assignments;