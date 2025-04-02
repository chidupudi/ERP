import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CircularProgress, 
  Typography, 
  TableContainer, 
  Paper, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Box,
  Card,
  CardContent,
  Divider,
  Alert,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';

function FacultyTimetable() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { facultyName } = useParams();
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchTimetable();
  }, [facultyName]);
  
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:5000/api/timetable/faculty/${encodeURIComponent(facultyName)}`
      );

      if (response.data.timetables && response.data.timetables.length > 0) {
        // Process each timetable to extract only the faculty's schedule
        const processedTimetables = response.data.timetables.map(timetable => {
          // Get faculty-specific schedule
          const facultySchedule = {};
          const days = Object.keys(timetable.schedule || {});
          
          days.forEach(day => {
            facultySchedule[day] = {};
            timetable.periods.forEach(period => {
              const periodValue = timetable.schedule[day][period.name];
              // Only show periods that belong to this faculty
              if (periodValue && periodValue.includes(facultyName)) {
                facultySchedule[day][period.name] = periodValue;
              } else {
                facultySchedule[day][period.name] = 'Free';
              }
            });
          });

          return {
            ...timetable,
            schedule: facultySchedule,
            // Get subjects taught by this faculty
            subjectsTaught: getSubjectsTaught(timetable)
          };
        });

        setTimetables(processedTimetables);
      } else {
        setError('No timetable assigned yet');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract subjects taught by this faculty
  const getSubjectsTaught = (timetable) => {
    const subjects = [];
    
    timetable.classes?.forEach(cls => {
      cls.subjects?.forEach(subject => {
        if (subject.faculty === facultyName) {
          subjects.push({
            subject: subject.name,
            class: cls.name,
            section: cls.section,
            classesPerWeek: subject.classesPerWeek
          });
        }
      });
    });
    
    return subjects;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const refreshTimetable = () => {
    fetchTimetable();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} mx={2} textAlign="center">
        <Alert 
          severity="error" 
          sx={{ maxWidth: 600, margin: '0 auto', mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={refreshTimetable}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (timetables.length === 0 && !error) {
    return (
      <Box mt={4} textAlign="center">
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No timetable has been assigned to {facultyName} yet.
        </Typography>
        <Button 
          variant="contained" 
          onClick={refreshTimetable}
          sx={{ mt: 2 }}
        >
          Check Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {facultyName}'s Teaching Schedule
        </Typography>
        <Button variant="outlined" onClick={refreshTimetable}>
          Refresh
        </Button>
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {timetables.map((timetable, index) => (
          <Tab 
            key={index} 
            label={`${timetable.semester} ${timetable.academicYear}`} 
          />
        ))}
      </Tabs>

      {timetables.map((timetable, index) => (
        <Box key={index} sx={{ display: index === activeTab ? 'block' : 'none', mb: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5">{timetable.name}</Typography>
              <Typography color="text.secondary">
                {timetable.academicYear} - {timetable.semester}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Teaching Assignments:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {timetable.subjectsTaught?.map((subject, idx) => (
                  <Card key={idx} variant="outlined" sx={{ p: 2 }}>
                    <Typography fontWeight="bold">{subject.subject}</Typography>
                    <Typography>Class {subject.class}-{subject.section}</Typography>
                    <Typography color="text.secondary">
                      {subject.classesPerWeek} sessions/week
                    </Typography>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                  {timetable.periods?.map(period => (
                    <TableCell key={period.name} align="center" sx={{ fontWeight: 'bold' }}>
                      <Box>
                        <div>{period.name}</div>
                        <div style={{ fontSize: '0.8rem' }}>{period.time}</div>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(timetable.schedule || {}).map(([day, periods]) => (
                  <TableRow key={day}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{day}</TableCell>
                    {timetable.periods?.map(period => (
                      <TableCell 
                        key={`${day}-${period.name}`} 
                        align="center"
                        sx={{ 
                          backgroundColor: periods[period.name] !== 'Free' 
                            ? theme.palette.success.light 
                            : 'inherit'
                        }}
                      >
                        {periods[period.name] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}

export default FacultyTimetable;