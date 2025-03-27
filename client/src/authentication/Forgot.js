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
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function ForgotPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('student'); // 'student' or 'faculty'
  const navigate = useNavigate();

  const validateWoxsenEmail = (email) => {
    return /^[a-zA-Z0-9._-]+@woxsen\.edu\.in$/i.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!validateWoxsenEmail(email)) {
      setError('Please enter a valid Woxsen email address (format: firstname.lastname@woxsen.edu.in)');
      setLoading(false);
      return;
    }

    try {
      const endpoint = userType === 'student' 
        ? '/api/students/forgot-password' 
        : '/api/faculty/forgot-password';

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      if (process.env.NODE_ENV === 'development' && data.otp) {
        setSuccess(`OTP would be sent to ${email}. For testing, use: ${data.otp}`);
        setOtp(data.otp); // Auto-fill OTP in development
      } else {
        setSuccess(`OTP has been sent to ${email}`);
      }
      
      setOtpSent(true);

    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = userType === 'student' 
        ? '/api/students/verify-otp' 
        : '/api/faculty/verify-otp';

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setOtpVerified(true);
      setSuccess('OTP verified. Please set your new password.');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
  
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const endpoint = userType === 'student' 
        ? '/api/students/reset-password' 
        : '/api/faculty/reset-password';
  
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          newPassword 
        }),
      });
  
      // First check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(text || 'Invalid response from server');
      }
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Password reset failed');
      }
  
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate(`/${userType}/login`), 2000);
  
    } catch (err) {
      // Handle JSON parse errors specifically
      if (err.message.includes('Unexpected token')) {
        setError('Server returned an invalid response. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!otpSent) return 'email';
    if (otpSent && !otpVerified) return 'otp';
    return 'reset';
  };

  const currentStep = getCurrentStep();

  const handleUserTypeChange = (event, newValue) => {
    setUserType(newValue);
    // Reset form when switching user types
    setEmail('');
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1
            }}>
              {currentStep === 'reset' ? <LockResetOutlinedIcon /> : <EmailOutlinedIcon />}
            </Box>
            <Typography variant="h5">
              {currentStep === 'email' && 'Forgot Password'}
              {currentStep === 'otp' && 'Verify OTP'}
              {currentStep === 'reset' && 'Reset Password'}
            </Typography>
            {currentStep !== 'email' && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                For: {email}
              </Typography>
            )}
          </Box>

          {/* User Type Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={userType} 
              onChange={handleUserTypeChange} 
              centered
              variant="fullWidth"
            >
              <Tab label="Student" value="student" />
              <Tab label="Faculty" value="faculty" />
            </Tabs>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {currentStep === 'email' && (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label={`Woxsen ${userType === 'student' ? 'Student' : 'Faculty'} Email`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                helperText="Format: firstname.lastname@woxsen.edu.in"
                error={email && !validateWoxsenEmail(email)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading || !validateWoxsenEmail(email)}
              >
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </Box>
          )}

          {currentStep === 'otp' && (
            <Box component="form" onSubmit={handleVerifyOtp}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                OTP sent to: {email}
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputProps={{ maxLength: 6 }}
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading || otp.length !== 6}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
                onClick={() => {
                  setOtpSent(false);
                  setError(null);
                  setSuccess(null);
                }}
              >
                Back to Email
              </Button>
            </Box>
          )}

          {currentStep === 'reset' && (
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                helperText="Minimum 8 characters"
              />
              <TextField
                fullWidth
                variant="outlined"
                margin="normal"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link href={`/${userType}/login`} variant="body2">
              Remember your password? Sign in
            </Link>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default ForgotPage;