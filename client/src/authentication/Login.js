import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Paper,
  CssBaseline,
  CircularProgress,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
    },
  },
});

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFaculty, setIsFaculty] = useState(true);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return isFaculty 
      ? /^[a-zA-Z0-9._-]+@woxsen\.edu\.in$/i.test(email)
      : /^[a-zA-Z0-9._-]+@(woxsen\.edu\.in|student\.woxsen\.edu\.in)$/i.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!validateEmail(email)) {
        throw new Error(`Please use your ${isFaculty ? 'Woxsen faculty' : 'Woxsen student'} email address`);
      }

      const endpoint = isFaculty 
        ? 'http://localhost:5000/api/faculty/login' 
        : 'http://localhost:5000/api/students/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and redirect
      if (isFaculty) {
        localStorage.setItem('facultyToken', data.token);
        localStorage.setItem('facultyData', JSON.stringify(data.faculty));
      } else {
        localStorage.setItem('studentToken', data.token);
        localStorage.setItem('studentData', JSON.stringify(data.student));
      }
      navigate('/dashboard');

    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs" sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              backgroundColor: isFaculty ? 'primary.main' : 'secondary.main',
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              mx: 'auto'
            }}>
              <LockOutlinedIcon />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 2,
              gap: 1
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: !isFaculty ? 'primary.main' : 'text.secondary',
                  fontWeight: !isFaculty ? 'bold' : 'normal'
                }}
              >
                Student
              </Typography>
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={isFaculty}
                onChange={() => setIsFaculty(!isFaculty)}
                style={{ backgroundColor: isFaculty ? '#1976d2' : '#4caf50' }}
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  color: isFaculty ? 'primary.main' : 'text.secondary',
                  fontWeight: isFaculty ? 'bold' : 'normal'
                }}
              >
                Faculty
              </Typography>
            </Box>
            
            <Typography component="h1" variant="h5">
              {isFaculty ? 'Faculty Sign In' : 'Student Sign In'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label={isFaculty ? "Woxsen Faculty Email" : "Woxsen Student Email"}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!email && !validateEmail(email)}
              helperText={email && !validateEmail(email) ? 
                `Must be ${isFaculty ? '@woxsen.edu.in' : '@woxsen.edu.in or @student.woxsen.edu.in'}` : ''}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{
                autoComplete: 'current-password',
                placeholder: ''
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color={isFaculty ? 'primary' : 'secondary'}
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !validateEmail(email) || !password}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/forgotpassword" variant="body2">
                Forgot Password?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default LoginPage;