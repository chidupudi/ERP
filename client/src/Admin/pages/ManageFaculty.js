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
import { 
  People as PeopleIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Search as SearchIcon 
} from '@mui/icons-material';
import axios from 'axios';

export default function FacultyManagement() {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    school: 'SOT', // Default to School of Technology
    phone: '',
    address: '',
    role: 'faculty'
  });
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    employeeId: false,
    phone: false
  });

  // Fetch faculty data
  useEffect(() => {
    fetchFaculty();
  }, []);

  // Filter faculty based on search term
  useEffect(() => {
    const filtered = facultyList.filter(faculty => {
      const searchLower = searchTerm.toLowerCase();
      return (
        faculty.firstName.toLowerCase().includes(searchLower) ||
        faculty.lastName.toLowerCase().includes(searchLower) ||
        faculty.email.toLowerCase().includes(searchLower) ||
        faculty.employeeId.toLowerCase().includes(searchLower) ||
        faculty.school.toLowerCase().includes(searchLower) ||
        faculty.role.toLowerCase().includes(searchLower)
      );
    });
    setFilteredFaculty(filtered);
  }, [searchTerm, facultyList]);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/faculty');
      setFacultyList(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch faculty data', 'error');
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
      email: !/^[^\s@]+@woxsen\.edu\.in$/i.test(formData.email),
      employeeId: !formData.employeeId.trim(),
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
        await axios.put(`http://localhost:5000/api/faculty/${currentFaculty._id}`, formData);
        showSnackbar('Faculty updated successfully', 'success');
      } else {
        await axios.post('http://localhost:5000/api/faculty', formData);
        showSnackbar('Faculty added successfully', 'success');
      }
      
      fetchFaculty();
      handleCloseDialog();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      showSnackbar(message, 'error');
    }
  };

  const handleEdit = (faculty) => {
    setCurrentFaculty(faculty);
    setFormData({
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      email: faculty.email,
      employeeId: faculty.employeeId,
      school: faculty.school,
      phone: faculty.phone,
      address: faculty.address,
      role: faculty.role
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/faculty/${deleteConfirm.id}`);
      showSnackbar('Faculty deleted successfully', 'success');
      fetchFaculty();
    } catch (error) {
      showSnackbar('Failed to delete faculty', 'error');
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, id: null });
  };

  const handleAddNew = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      school: 'SOT',
      phone: '',
      address: '',
      role: 'faculty'
    });
    setCurrentFaculty(null);
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setErrors({
      firstName: false,
      lastName: false,
      email: false,
      employeeId: false,
      phone: false
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1 }} /> Faculty Management
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddNew}
            >
              Add Faculty
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFaculty.map((faculty) => (
              <TableRow key={faculty._id}>
                <TableCell>{faculty.firstName} {faculty.lastName}</TableCell>
                <TableCell>{faculty.email}</TableCell>
                <TableCell>{faculty.employeeId}</TableCell>
                <TableCell>{faculty.school}</TableCell>
                <TableCell>{faculty.role}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(faculty)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(faculty._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Faculty Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
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
              helperText={errors.email ? 'Valid Woxsen email required (user@woxsen.edu.in)' : ''}
            />
            <TextField
              fullWidth
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              error={errors.employeeId}
              helperText={errors.employeeId && 'Employee ID is required'}
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
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleInputChange}
              >
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="hod">Head of Department</MenuItem>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this faculty member?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
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