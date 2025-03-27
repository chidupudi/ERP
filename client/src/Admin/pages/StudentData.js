// StudentData.js (React component)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { School as SchoolIcon, Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

export default function StudentManagement() {
  const [studentList, setStudentList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    school: 'SOA',
    phone: '',
    address: '',
    degree: 'B.Tech',
    year: '1',
    section: 'A'
  });
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    studentId: false,
    phone: false
  });

  // Fetch student data
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudentList(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch student data', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };
  const validateForm = () => {
    const newErrors = {
      firstName: !formData.firstName.trim(),
      lastName: !formData.lastName.trim(),
      email: !formData.email.endsWith('@woxsen.edu.in'),
      studentId: !formData.studentId.trim(),
      phone: !/^[0-9]{10}$/.test(formData.phone)
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fill all required fields correctly', 'error');
      return;
    }

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/students/${currentStudent._id}`, formData);
        showSnackbar('Student updated successfully', 'success');
      } else {
        await axios.post('http://localhost:5000/api/students', formData);
        showSnackbar('Student added successfully', 'success');
      }
      
      fetchStudents();
      handleCloseDialog();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      showSnackbar(message, 'error');
    }
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentId: student.studentId,
      school: student.school,
      phone: student.phone,
      address: student.address,
      degree: student.degree,
      year: student.year,
      section: student.section
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`);
      showSnackbar('Student deleted successfully', 'success');
      fetchStudents();
    } catch (error) {
      showSnackbar('Failed to delete student', 'error');
    }
  };

  const handleAddNew = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      school: 'SOA',
      phone: '',
      address: '',
      degree: 'B.Tech',
      year: '1',
      section: 'A'
    });
    setCurrentStudent(null);
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setErrors({
      firstName: false,
      lastName: false,
      email: false,
      studentId: false,
      phone: false
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1 }} /> Student Management
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddNew}
            >
              Add Student
            </Button>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Degree</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentList.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.firstName} {student.lastName}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.school}</TableCell>
                <TableCell>{student.degree}</TableCell>
                <TableCell>{student.year}</TableCell>
                <TableCell>{student.section}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(student)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(student._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Student Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              helperText={errors.firstName && 'First name is required'}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              helperText={errors.lastName && 'Last name is required'}
            />
            <TextField
               fullWidth
               label="Email"
               name="email"
               value={formData.email}
               onChange={handleInputChange}
               error={errors.email}
              helperText={errors.email ? 'Email must end with @woxsen.edu.in' : ''}
            />
            <TextField
              fullWidth
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              error={errors.studentId}
              helperText={errors.studentId && 'Student ID is required'}
            />
            <FormControl fullWidth>
              <InputLabel>School</InputLabel>
              <Select
                name="school"
                value={formData.school}
                label="School"
                onChange={handleInputChange}
              >
                <MenuItem value="SOA">School of Arts</MenuItem>
                <MenuItem value="SOH">School of Humanities</MenuItem>
                <MenuItem value="SOT">School of Technology</MenuItem>
                <MenuItem value="SOL">School of Law</MenuItem>
                <MenuItem value="SOM">School of Management</MenuItem>
                <MenuItem value="SOD">School of Design</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              helperText={errors.phone ? 'Valid 10-digit phone number required' : ''}
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Degree</InputLabel>
              <Select
                name="degree"
                value={formData.degree}
                label="Degree"
                onChange={handleInputChange}
              >
                <MenuItem value="B.Tech">B.Tech</MenuItem>
                <MenuItem value="BBA">BBA</MenuItem>
                <MenuItem value="B.Des">B.Des</MenuItem>
                <MenuItem value="B.Arch">B.Arch</MenuItem>
                <MenuItem value="B.Sc">B.Sc</MenuItem>
                <MenuItem value="M.Tech">M.Tech</MenuItem>
                <MenuItem value="MBA">MBA</MenuItem>
                <MenuItem value="PhD">PhD</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                name="year"
                value={formData.year}
                label="Year"
                onChange={handleInputChange}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select
                name="section"
                value={formData.section}
                label="Section"
                onChange={handleInputChange}
              >
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="D">D</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}