import * as React from 'react';
import { styled } from '@mui/material/styles';
import EventNoteIcon from '@mui/icons-material/EventNote'; // Time Table
import HowToRegIcon from '@mui/icons-material/HowToReg'; // Attendance
import AssignmentIcon from '@mui/icons-material/Assignment'; // Assignments
import QuizIcon from '@mui/icons-material/Quiz'; // Assessments
import GradeIcon from '@mui/icons-material/Grade'; // Grades
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Importing the actual pages
import TimeTable from '../pages/TimeTable';
import Attendance from '../pages/Attendance';
import Assignments from '../pages/Assignments';
import Assessments from '../pages/Assessments';
import Grades from '../pages/Grades';

const NAVIGATION = [
  {
    kind: 'header',
    title: 'Academic Menu',
  },
  {
    segment: 'timetable',
    title: 'Time Table',
    icon: <EventNoteIcon />,
    component: <TimeTable />, // Directly linking the component
  },
  {
    segment: 'attendance',
    title: 'Attendance',
    icon: <HowToRegIcon />,
    component: <Attendance />,
  },
  {
    segment: 'assignments',
    title: 'Assignments',
    icon: <AssignmentIcon />,
    component: <Assignments />,
  },
  {
    segment: 'assessments',
    title: 'Assessments',
    icon: <QuizIcon />,
    component: <Assessments />,
  },
  {
    segment: 'grades',
    title: 'Grades',
    icon: <GradeIcon />,
    component: <Grades />,
  },
];

function useDemoRouter(initialPath) {
  const [pathname, setPathname] = React.useState(initialPath);

  return React.useMemo(() => ({
    pathname,
    searchParams: new URLSearchParams(),
    navigate: (path) => setPathname(String(path)),
  }), [pathname]);
}

// Function to render the selected page dynamically
function RenderPage(path) {
  const selectedNav = NAVIGATION.find((item) => `/` + item.segment === path);
  return selectedNav ? selectedNav.component : <TimeTable />;
}

const Skeleton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

export default function Sidebar(props) {
  const { window } = props;
  const router = useDemoRouter('/timetable');
  const demoWindow = window ? window() : undefined;
  const navigate = useNavigate(); // Hook for navigation

  return (
    <AppProvider navigation={NAVIGATION} router={router} window={demoWindow}>
      <DashboardLayout>
        <PageContainer>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {RenderPage(router.pathname)}
            </Grid>
          </Grid>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}