import * as React from 'react';
import { createTheme  } from '@mui/material/styles';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Grid from '@mui/material/Grid';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';

// Import admin pages
import UploadTimetable from '../pages/UploadTimetable';
import FacultyManagement from '../pages/ManageFaculty';
import StudentData from '../pages/StudentData';

// Theme configuration
const demoTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-toolpad-color-scheme' },
  colorSchemes: { light: true, dark: true },
});

// Navigation configuration with components
const getNavigation = () => [
  { kind: 'header', title: 'Admin Panel' },
  { 
    segment: 'upload-timetable', 
    title: 'Upload Timetable', 
    icon: <UploadFileIcon />,
    component: <UploadTimetable />
  },
  { 
    segment: 'faculty-management', 
    title: 'Manage Faculty', 
    icon: <PeopleIcon />,
    component: <FacultyManagement />
  },
  { 
    segment: 'student-data', 
    title: 'Students', 
    icon: <SchoolIcon />,
    component: <StudentData />
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
function RenderPage(path, navigation) {
  const selectedNav = navigation.find((item) => item.segment && `/` + item.segment === path);
  return selectedNav ? selectedNav.component : <UploadTimetable />;
}

export default function AdminLayout({ children, window }) {
  const navigation = React.useMemo(() => getNavigation(), []);
  const router = useDemoRouter('/upload-timetable');
  const demoWindow = window ? window() : undefined;
  //const navigate = useNavigate();

  return (
    <AppProvider navigation={navigation} router={router} theme={demoTheme} window={demoWindow}>
      <DashboardLayout>
        <PageContainer>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {RenderPage(router.pathname, navigation)}
              {children}
            </Grid>
          </Grid>
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}