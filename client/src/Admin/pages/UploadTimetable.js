import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const subjectsList = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];
const semesterOptions = ['Spring', 'Summer', 'Fall', 'Winter'];

// Timing configuration
const dayStart = 9 * 60; // 9:00 AM in minutes
const dayEnd = 17 * 60 + 20; // 5:20 PM in minutes
const lunchStart = 12 * 60; // 12:00 PM in minutes
const lunchEnd = 13 * 60 + 15; // 1:15 PM in minutes
const periodDuration = 50; // 50 minutes per period
const breakDuration = 10; // 10 minutes between periods

const generatePeriods = () => {
  const periods = [];
  let currentTime = dayStart;
  let periodNumber = 1;

  while (currentTime + periodDuration <= dayEnd) {
    if (currentTime + periodDuration <= lunchStart || currentTime >= lunchEnd) {
      const startHour = Math.floor(currentTime / 60);
      const startMin = currentTime % 60;
      const endTime = currentTime + periodDuration;
      const endHour = Math.floor(endTime / 60);
      const endMin = endTime % 60;

      periods.push({
        name: `Period ${periodNumber}`,
        time: `${startHour}:${startMin < 10 ? '0' + startMin : startMin} - ${endHour}:${endMin < 10 ? '0' + endMin : endMin}`,
        start: currentTime,
        end: endTime
      });
      periodNumber++;

      if (endTime + breakDuration <= dayEnd && !(endTime + breakDuration > lunchStart && endTime < lunchEnd)) {
        currentTime = endTime + breakDuration;
      } else {
        currentTime = endTime;
      }
    } else {
      currentTime = lunchEnd;
    }
  }

  return periods;
};

const periods = generatePeriods();

export default function TimetableManager() {
  const [tabValue, setTabValue] = useState('view');
  const [timetables, setTimetables] = useState([]);
  const [newTimetable, setNewTimetable] = useState({
    name: '',
    academicYear: '2023-2024',
    semester: 'Fall',
    classes: [
      { name: 'Class A', section: 'A', subjects: [] },
      { name: 'Class B', section: 'B', subjects: [] },
      { name: 'Class C', section: 'C', subjects: [] }
    ]
  });
  const [viewMode, setViewMode] = useState('class');
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [facultyError, setFacultyError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchFaculties = async () => {
      setLoadingFaculties(true);
      setFacultyError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/faculty');
        const facultyOptions = response.data.map(faculty => ({
          id: faculty._id,
          fullName: `${faculty.firstName} ${faculty.lastName}`,
          firstName: faculty.firstName,
          lastName: faculty.lastName
        }));
        setFacultyList(facultyOptions);
      } catch (error) {
        setFacultyError(error.message);
        console.error('Error fetching faculties:', error);
        showSnackbar('Failed to load faculty data', 'error');
      } finally {
        setLoadingFaculties(false);
      }
    };

    const fetchTimetables = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/timetable');
        setTimetables(response.data.timetables);
      } catch (error) {
        console.error('Error fetching timetables:', error);
        showSnackbar('Failed to load timetables', 'error');
      }
    };

    fetchTimetables();
    fetchFaculties();
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateNew = () => {
    setTabValue('create');
    setNewTimetable({
      name: '',
      academicYear: '2023-2024',
      semester: 'Fall',
      classes: [
        { name: 'Class A', section: 'A', subjects: [] },
        { name: 'Class B', section: 'B', subjects: [] },
        { name: 'Class C', section: 'C', subjects: [] }
      ]
    });
  };

  const handleAddSubject = (classIndex) => {
    const updatedClasses = [...newTimetable.classes];
    updatedClasses[classIndex].subjects = [
      ...updatedClasses[classIndex].subjects,
      { name: '', faculty: '', classesPerWeek: 0 }
    ];
    setNewTimetable({ ...newTimetable, classes: updatedClasses });
  };

  const handleSubjectChange = (classIndex, subjectIndex, field, value) => {
    const updatedClasses = [...newTimetable.classes];
    updatedClasses[classIndex].subjects[subjectIndex][field] = value;
    setNewTimetable({ ...newTimetable, classes: updatedClasses });
  };

  const handleRemoveSubject = (classIndex, subjectIndex) => {
    const updatedClasses = [...newTimetable.classes];
    updatedClasses[classIndex].subjects.splice(subjectIndex, 1);
    setNewTimetable({ ...newTimetable, classes: updatedClasses });
  };

  const validateTimetable = () => {
    // Check if all required fields are filled
    if (!newTimetable.name || !newTimetable.academicYear || !newTimetable.semester) {
      showSnackbar('Please fill all timetable details', 'error');
      return false;
    }

    // Check each class has at least one subject with valid faculty
    for (const cls of newTimetable.classes) {
      if (!cls.section || cls.subjects.length === 0) {
        showSnackbar(`Class ${cls.name} must have at least one subject`, 'error');
        return false;
      }

      for (const subject of cls.subjects) {
        if (!subject.name || !subject.faculty || subject.classesPerWeek < 1) {
          showSnackbar(`Please fill all subject details for ${cls.name}`, 'error');
          return false;
        }

        // Verify faculty exists
        const faculty = facultyList.find(f => f.fullName === subject.faculty);
        if (!faculty) {
          showSnackbar(`Invalid faculty selected for ${subject.name} in ${cls.name}`, 'error');
          return false;
        }
      }
    }

    return true;
  };

  const generateTimetable = async () => {
    if (!validateTimetable()) {
      return;
    }

    setLoading(true);
    try {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const classTimetables = {};
      const facultyTimetables = {};

      // Initialize empty timetables
      newTimetable.classes.forEach(cls => {
        classTimetables[cls.name] = {};
        days.forEach(day => {
          classTimetables[cls.name][day] = {};
          periods.forEach(period => {
            classTimetables[cls.name][day][period.name] = 'Free';
          });
        });
      });

      // Assign subjects to periods
      for (const cls of newTimetable.classes) {
        for (const subject of cls.subjects) {
          const faculty = facultyList.find(f => f.fullName === subject.faculty);
          if (!faculty) {
            showSnackbar(`Faculty not found for ${subject.faculty}`, 'error');
            continue;
          }

          let classesToAssign = subject.classesPerWeek;
          let attempts = 0;
          const maxAttempts = 100;

          while (classesToAssign > 0 && attempts < maxAttempts) {
            attempts++;
            const randomDay = days[Math.floor(Math.random() * days.length)];
            const randomPeriod = periods[Math.floor(Math.random() * periods.length)];

            if (classTimetables[cls.name][randomDay][randomPeriod.name] === 'Free') {
              // Check if faculty is available at this time
              const facultySchedule = facultyTimetables[faculty.fullName] || {};
              const facultyDaySchedule = facultySchedule[randomDay] || {};
              
              if (!facultyDaySchedule[randomPeriod.name]) {
                // Assign the class
                classTimetables[cls.name][randomDay][randomPeriod.name] = 
                  `${subject.name} (${faculty.fullName})`;

                // Initialize faculty timetable if not exists
                if (!facultyTimetables[faculty.fullName]) {
                  facultyTimetables[faculty.fullName] = {};
                  days.forEach(day => {
                    facultyTimetables[faculty.fullName][day] = {};
                    periods.forEach(period => {
                      facultyTimetables[faculty.fullName][day][period.name] = 'Free';
                    });
                  });
                }

                facultyTimetables[faculty.fullName][randomDay][randomPeriod.name] = 
                  `${subject.name} (${cls.name})`;

                classesToAssign--;
              }
            }
          }

          if (classesToAssign > 0) {
            showSnackbar(`Could not assign all classes for ${subject.name} in ${cls.name}`, 'warning');
          }
        }
      }

      // Prepare data for submission
      const timetableData = {
        name: newTimetable.name,
        academicYear: newTimetable.academicYear,
        semester: newTimetable.semester,
        classes: newTimetable.classes.map(cls => ({
          name: cls.name,
          section: cls.section,
          subjects: cls.subjects.map(subject => {
            const faculty = facultyList.find(f => f.fullName === subject.faculty);
            return {
              name: subject.name,
              faculty: faculty ? faculty.id : null,
              classesPerWeek: subject.classesPerWeek
            };
          }).filter(subject => subject.faculty !== null)
        })),
        schedule: {
          classView: classTimetables,
          facultyView: facultyTimetables,
          periods: periods
        },
        createdBy: localStorage.getItem('userId') || "admin" // Replace with actual user ID
      };

      // Submit to backend
      const response = await axios.post(
        'http://localhost:5000/api/timetable',
        timetableData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setGeneratedTimetable({
        classView: classTimetables,
        facultyView: facultyTimetables,
        periods: periods
      });

      // Refresh timetable list
      const timetablesResponse = await axios.get('http://localhost:5000/api/timetable');
      setTimetables(timetablesResponse.data.timetables);

      setTabValue('generated');
      showSnackbar('Timetable generated successfully!', 'success');
    } catch (error) {
      console.error('Error saving timetable:', error);
      const errorMsg = error.response?.data?.message || 'An unexpected error occurred while saving the timetable.';
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        await axios.post('http://localhost:5000/api/timetable/upload', data, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const response = await axios.get('http://localhost:5000/api/timetable');
        setTimetables(response.data.timetables);
        showSnackbar('Timetable uploaded successfully!', 'success');
      } catch (error) {
        console.error('Error uploading timetable:', error);
        showSnackbar('Failed to upload timetable', 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Timetable Management</Typography>
        {tabValue === 'view' && (
          <Button variant="contained" onClick={handleCreateNew} startIcon={<AddIcon />}>
            Create New Timetable
          </Button>
        )}
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="View Timetables" value="view" />
        <Tab label="Create Timetable" value="create" />
        {generatedTimetable && <Tab label="Generated Timetable" value="generated" />}
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {tabValue === 'view' && !loading && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Upload Existing Timetable</Typography>
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
            </CardContent>
          </Card>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Existing Timetables</Typography>
          {timetables.length === 0 ? (
            <Typography>No timetables available. Create a new one.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {timetables.map(timetable => (
                <Card key={timetable.id} sx={{ minWidth: 300, width: '30%' }}>
                  <CardContent>
                    <Typography variant="h6">{timetable.name}</Typography>
                    <Typography color="text.secondary">
                      {timetable.academicYear} - {timetable.semester}
                    </Typography>
                    <Typography color="text.secondary">
                      {timetable.classes.length} classes
                    </Typography>
                    <Button 
                      size="small" 
                      sx={{ mt: 1 }}
                      onClick={() => {
                        setNewTimetable({
                          name: `${timetable.name} (Copy)`,
                          academicYear: timetable.academicYear,
                          semester: timetable.semester,
                          classes: timetable.classes
                        });
                        setTabValue('create');
                      }}
                    >
                      View/Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {tabValue === 'create' && !loading && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Timetable Name"
              value={newTimetable.name}
              onChange={(e) => setNewTimetable({ ...newTimetable, name: e.target.value })}
              fullWidth
              required
              error={!newTimetable.name}
              helperText={!newTimetable.name && 'Timetable name is required'}
            />
            <TextField
              label="Academic Year"
              value={newTimetable.academicYear}
              onChange={(e) => setNewTimetable({ ...newTimetable, academicYear: e.target.value })}
              fullWidth
              required
              error={!newTimetable.academicYear}
              helperText={!newTimetable.academicYear && 'Academic year is required'}
            />
            <FormControl fullWidth required error={!newTimetable.semester}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={newTimetable.semester}
                onChange={(e) => setNewTimetable({ ...newTimetable, semester: e.target.value })}
                label="Semester"
              >
                {semesterOptions.map(semester => (
                  <MenuItem key={semester} value={semester}>{semester}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="h6" gutterBottom>Classes</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {newTimetable.classes.map((cls, classIndex) => (
              <Card key={classIndex} sx={{ width: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h6">{cls.name}</Typography>
                    <TextField
                      label="Section"
                      value={cls.section}
                      onChange={(e) => {
                        const updatedClasses = [...newTimetable.classes];
                        updatedClasses[classIndex].section = e.target.value;
                        setNewTimetable({ ...newTimetable, classes: updatedClasses });
                      }}
                      size="small"
                      required
                      error={!cls.section}
                      helperText={!cls.section && 'Section is required'}
                    />
                  </Box>
                  
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell>Faculty</TableCell>
                          <TableCell>Classes/Week</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cls.subjects.map((subject, subjectIndex) => (
                          <TableRow key={subjectIndex}>
                            <TableCell>
                              <FormControl fullWidth size="small" required error={!subject.name}>
                                <InputLabel>Subject</InputLabel>
                                <Select
                                  value={subject.name}
                                  onChange={(e) => handleSubjectChange(classIndex, subjectIndex, 'name', e.target.value)}
                                >
                                  {subjectsList.map(sub => (
                                    <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>                          
                            <TableCell>
                              {loadingFaculties ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                  <CircularProgress size={24} />
                                </Box>
                              ) : facultyError ? (
                                <Typography color="error">Error loading faculties</Typography>
                              ) : (
                                <FormControl fullWidth size="small" required error={!subject.faculty}>
                                  <InputLabel>Faculty</InputLabel>
                                  <Select
                                    value={subject.faculty}
                                    onChange={(e) => handleSubjectChange(classIndex, subjectIndex, 'faculty', e.target.value)}
                                  >
                                    {facultyList.map(faculty => (
                                      <MenuItem key={faculty.id} value={faculty.fullName}>
                                        {faculty.fullName}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                value={subject.classesPerWeek}
                                onChange={(e) => handleSubjectChange(classIndex, subjectIndex, 'classesPerWeek', parseInt(e.target.value) || 0)}
                                size="small"
                                inputProps={{ min: 1 }}
                                required
                                error={subject.classesPerWeek < 1}
                                helperText={subject.classesPerWeek < 1 && 'Must be at least 1'}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                onClick={() => handleRemoveSubject(classIndex, subjectIndex)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={() => handleAddSubject(classIndex)}
                    sx={{ mt: 1 }}
                  >
                    Add Subject
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={generateTimetable}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Generating...' : 'Generate Timetable'}
            </Button>
          </Box>
        </Box>
      )}

      {tabValue === 'generated' && generatedTimetable && !loading && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{newTimetable.name}</Typography>
            <Typography variant="subtitle1">{newTimetable.academicYear} - {newTimetable.semester}</Typography>
            <Box>
              <Button 
                variant={viewMode === 'class' ? 'contained' : 'outlined'} 
                onClick={() => setViewMode('class')}
                sx={{ mr: 1 }}
              >
                Class View
              </Button>
              <Button 
                variant={viewMode === 'faculty' ? 'contained' : 'outlined'} 
                onClick={() => setViewMode('faculty')}
              >
                Faculty View
              </Button>
            </Box>
          </Box>

          {viewMode === 'class' ? (
            Object.entries(generatedTimetable.classView).map(([className, schedule]) => (
              <Box key={className} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>{className}</Typography>
                <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day/Period</TableCell>
                        {generatedTimetable.periods.map(period => (
                          <TableCell key={period.name} sx={{ minWidth: 150 }}>
                            <div>{period.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{period.time}</div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(schedule).map(([day, periods]) => (
                        <TableRow key={day}>
                          <TableCell>{day}</TableCell>
                          {generatedTimetable.periods.map(period => (
                            <TableCell key={`${day}-${period.name}`}>
                              {periods[period.name]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))
          ) : (
            Object.entries(generatedTimetable.facultyView).map(([facultyName, schedule]) => (
              <Box key={facultyName} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>{facultyName}</Typography>
                <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Day/Period</TableCell>
                        {generatedTimetable.periods.map(period => (
                          <TableCell key={period.name} sx={{ minWidth: 150 }}>
                            <div>{period.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{period.time}</div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(schedule).map(([day, periods]) => (
                        <TableRow key={day}>
                          <TableCell>{day}</TableCell>
                          {generatedTimetable.periods.map(period => (
                            <TableCell key={`${day}-${period.name}`}>
                              {periods[period.name]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}