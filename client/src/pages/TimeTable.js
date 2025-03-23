import React, { useState } from 'react';
import timetableData from '../utils/timetableData.json'; // Adjust the path to your JSON file
import { useTheme, styled } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Icon for completed sessions

function TimeTable() {
  const theme = useTheme(); // Get the current theme
  const isDarkMode = theme.palette.mode === 'dark'; // Check if dark mode is enabled

  // Days of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Time slots from 9 AM to 5 PM
  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
  ];

  // State to manage timetable data
  const [timetable, setTimetable] = useState(timetableData.timetable);

  // State for rescheduling confirmation dialog
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    sourceDay: '',
    sourceTime: '',
    targetDay: '',
    targetTime: '',
    class: '',
    room: '',
  });

  // State for cancel class confirmation dialog
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelData, setCancelData] = useState({
    day: '',
    time: '',
  });

  // Function to mark a session as completed
  const markAsCompleted = (day, time) => {
    const updatedTimetable = timetable.map((daySchedule) => {
      if (daySchedule.day === day) {
        return {
          ...daySchedule,
          schedule: daySchedule.schedule.map((s) =>
            s.time === time ? { ...s, completed: true } : s
          ),
        };
      }
      return daySchedule;
    });
    setTimetable(updatedTimetable);
  };

  // Function to handle cell click
  const handleCellClick = (day, time) => {
    const daySchedule = timetable.find((d) => d.day === day);
    const schedule = daySchedule.schedule.find((s) => s.time === time);
    console.log(`Clicked on ${day} at ${time}:`, schedule);
  };

  // Function to handle drag start
  const handleDragStart = (e, day, time) => {
    const daySchedule = timetable.find((d) => d.day === day);
    const schedule = daySchedule.schedule.find((s) => s.time === time);
    e.dataTransfer.setData('text/plain', JSON.stringify({ day, time, schedule }));
  };

  // Function to handle drag over
  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (e, targetDay, targetTime) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { day: sourceDay, time: sourceTime, schedule } = data;
  
    if (sourceDay === targetDay && sourceTime === targetTime) return; // No changes if same cell
  
    // Set the reschedule data for the confirmation dialog
    setRescheduleData({
      sourceDay,
      sourceTime,
      targetDay,
      targetTime,
      class: schedule.class,
      room: schedule.room,
    });

    // Open the reschedule confirmation dialog
    setIsRescheduleDialogOpen(true);
  };
  
  // Function to confirm rescheduling
  const confirmReschedule = () => {
    const { sourceDay, sourceTime, targetDay, targetTime, class: className, room } = rescheduleData;

    // Update the timetable state
    const updatedTimetable = timetable.map((daySchedule) => {
      if (daySchedule.day === sourceDay) {
        // Remove the class from the source cell
        return {
          ...daySchedule,
          schedule: daySchedule.schedule.map((s) =>
            s.time === sourceTime ? { ...s, class: '', room: '', completed: false } : s
          ),
        };
      }
      if (daySchedule.day === targetDay) {
        // Add the class to the target cell
        return {
          ...daySchedule,
          schedule: daySchedule.schedule.map((s) =>
            s.time === targetTime ? { ...s, class: className, room, completed: false } : s
          ),
        };
      }
      return daySchedule;
    });

    setTimetable(updatedTimetable);
    setIsRescheduleDialogOpen(false); // Close the dialog
  };

  // Function to cancel rescheduling
  const cancelReschedule = () => {
    setIsRescheduleDialogOpen(false); // Close the dialog without making changes
  };

  // Function to handle right-click and show cancel confirmation dialog
  const handleContextMenu = (e, day, time) => {
    e.preventDefault(); // Prevent the default context menu

    // Set the cell details for the cancel confirmation dialog
    setCancelData({ day, time });

    // Open the cancel confirmation dialog
    setIsCancelDialogOpen(true);
  };

  // Function to confirm canceling a class
  const confirmCancel = () => {
    const { day, time } = cancelData;

    // Update the timetable state to remove the class
    const updatedTimetable = timetable.map((daySchedule) => {
      if (daySchedule.day === day) {
        return {
          ...daySchedule,
          schedule: daySchedule.schedule.map((s) =>
            s.time === time ? { ...s, class: '', room: '', completed: false } : s
          ),
        };
      }
      return daySchedule;
    });

    setTimetable(updatedTimetable);
    setIsCancelDialogOpen(false); // Close the dialog
  };

  // Function to cancel the cancel action
  const cancelCancel = () => {
    setIsCancelDialogOpen(false); // Close the dialog without making changes
  };

  // Styled components for dynamic theming
  const TableContainer = styled('div')(({ theme }) => ({
    margin: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  }));

  const Table = styled('table')(({ theme }) => ({
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center',
    boxShadow: theme.shadows[3],
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  }));

  const Th = styled('th')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: '15px',
    border: `1px solid ${theme.palette.divider}`,
  }));

  const Td = styled('td')(({ theme }) => ({
    padding: '15px',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    position: 'relative',
  }));

  const ClassName = styled('div')(({ theme }) => ({
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  }));

  const Room = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '0.9em',
  }));

  const EmptyCell = styled('div')(({ theme }) => ({
    color: theme.palette.text.disabled,
  }));

  const CompletedIndicator = styled('div')(({ theme }) => ({
    position: 'absolute',
    top: '5px',
    right: '5px',
    color: theme.palette.success.main,
  }));

  return (
    <TableContainer>
      <h2 style={{ textAlign: 'center', color: theme.palette.text.primary }}>Time Table Page</h2>
      <Table>
        <thead>
          <tr>
            <Th>Day</Th>
            {timeSlots.map((time, index) => (
              <Th key={index}>{time}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => {
            const daySchedule = timetable.find((d) => d.day === day);

            return (
              <tr key={dayIndex}>
                <Td>{day}</Td>
                {timeSlots.map((time, timeIndex) => {
                  const schedule = daySchedule.schedule.find((s) => s.time === time);

                  return (
                    <Td
                      key={timeIndex}
                      onClick={() => handleCellClick(day, time)}
                      onContextMenu={(e) => handleContextMenu(e, day, time)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, day, time)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, time)}
                      style={{
                        backgroundColor: schedule?.completed
                          ? theme.palette.success.light
                          : theme.palette.background.paper,
                      }}
                    >
                      {schedule?.class ? (
                        <>
                          <ClassName>{schedule.class}</ClassName>
                          <Room>{schedule.room}</Room>
                          {!schedule.completed && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent cell click
                                markAsCompleted(day, time);
                              }}
                              style={{ position: 'absolute', top: '5px', right: '5px' }}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          )}
                          {schedule.completed && (
                            <CompletedIndicator>
                              <CheckCircleIcon fontSize="small" />
                            </CompletedIndicator>
                          )}
                        </>
                      ) : (
                        <EmptyCell>-</EmptyCell>
                      )}
                    </Td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>

      {/* Rescheduling Confirmation Dialog */}
      <Dialog open={isRescheduleDialogOpen} onClose={cancelReschedule}>
        <DialogTitle>Confirm Rescheduling</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to reschedule <strong>{rescheduleData.class}</strong> from{' '}
            <strong>
              {rescheduleData.sourceDay} ({rescheduleData.sourceTime})
            </strong>{' '}
            to{' '}
            <strong>
              {rescheduleData.targetDay} ({rescheduleData.targetTime})
            </strong>
            ?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelReschedule} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmReschedule} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Class Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onClose={cancelCancel}>
        <DialogTitle>Confirm Cancel Class</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to cancel the class on{' '}
            <strong>
              {cancelData.day} ({cancelData.time})
            </strong>
            ?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmCancel} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
}

export default TimeTable;