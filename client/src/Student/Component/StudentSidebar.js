import * as React from 'react';
import { styled } from '@mui/material/styles';
import HowToRegIcon from '@mui/icons-material/HowToReg'; // Attendance
import GradeIcon from '@mui/icons-material/Grade'; // Grades
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';

// Importing the actual pages
import Attendance from '../pages/Attendance';
import Grades from '../pages/Grades';

const STUDENT_NAVIGATION = [
  {
    kind: 'header',
    title: 'Student Menu',
  },
  {
    segment: 'attendance',
    title: 'Attendance',
    icon: <HowToRegIcon />,
    component: <Attendance />,
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

function RenderPage(path) {
  const selectedNav = STUDENT_NAVIGATION.find((item) => `/` + item.segment === path);
  return selectedNav ? selectedNav.component : <Attendance />; // Default to Attendance
}

const Skeleton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

export default function StudentSidebar(props) {
  const { window } = props;
  const router = useDemoRouter('/attendance');
  const demoWindow = window ? window() : undefined;
  const navigate = useNavigate();

  return (
    <AppProvider navigation={STUDENT_NAVIGATION} router={router} window={demoWindow}>
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