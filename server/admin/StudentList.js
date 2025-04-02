// Server-side route (students.js)
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Student Schema
const studentSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return v.endsWith('@woxsen.edu.in');
      },
      message: props => `${props.value} is not a valid Woxsen email! Must end with @woxsen.edu.in`
    },
    required: true
  },
  studentId: { 
    type: String, 
    required: true,
    unique: true
  },
  school: {
    type: String,
    required: true,
    enum: ['SOAD', 'SOB', 'SOT', 'SOL', 'SOS' ]
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true,
    enum: ['B.Tech', 'BBA', 'B.Des', 'B.Arch', 'B.Sc', 'M.Tech', 'MBA', 'PhD']
  },
  year: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4', '5']
  },
  section: {
    type: String,
    required: true,
    
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Pre-save hook to generate email (password remains plain text)
studentSchema.pre('save', function(next) {
  if (!this.email) {
    this.email = `${this.firstName.toLowerCase()}.${this.lastName.toLowerCase()}@woxsen.edu.in`;
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpStorage = new Map();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
// Validate email format
if (!email.endsWith('@woxsen.edu.in')) {
    return res.status(400).json({ message: 'Only Woxsen email addresses are allowed' });
  }
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare plain text password (INSECURE)
    if (password !== student.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret is not configured');
    }

    const token = jwt.sign(
      { 
        id: student._id, 
        email: student.email,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
   

    // Remove password from response
    const studentResponse = student.toObject();
    delete studentResponse.password;

    res.json({ 
      message: 'Login successful',
      token,
      student: studentResponse
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: err.message === 'JWT secret is not configured' 
        ? 'Server configuration error' 
        : 'Login failed. Please try again.' 
    });
  }
});

// Get All Students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new student
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, studentId, school, phone, address, degree, year, section } = req.body;
    
    // Default password is studentId (stored in plain text)
    const password = studentId;

    // Check if studentId already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const student = new Student({
      firstName,
      lastName,
      email,
      studentId,
      school,
      phone,
      address,
      degree,
      year,
      section,
      password
    });

    const newStudent = await student.save();
    
    // Remove password from response
    const studentResponse = newStudent.toObject();
    delete studentResponse.password;
    
    res.status(201).json(studentResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, studentId, school, phone, address, degree, year, section } = req.body;

    // Check if studentId exists for another student
    const existingStudent = await Student.findOne({ 
      studentId,
      _id: { $ne: id }
    });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student ID already exists for another student' });
    }

    // Check if email exists for another student
    const existingEmail = await Student.findOne({ 
      email,
      _id: { $ne: id }
    });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists for another student' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { firstName, lastName, email, studentId, school, phone, address, degree, year, section },
      { new: true }
    ).select('-password');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check Email Endpoint
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

   // Validate email format
if (!email.endsWith('@woxsen.edu.in')) {
    return res.status(400).json({ message: 'Only Woxsen email addresses are allowed' });
  }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student email not found' });
    }

    res.status(200).json({ exists: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password Endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const otp = generateOTP();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    otpStorage.set(email, { otp, expiry: otpExpiry });

    // Extract name from email
    const nameParts = email.split('@')[0].split('.');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[1] : '';

    // Send email with Nodemailer
    const mailOptions = {
      from: `"Woxsen University" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Woxsen OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">Woxsen University</h2>
          <p>Dear ${firstName} ${lastName},</p>
          <p>Your OTP verification code is:</p>
          <h3 style="text-align: center; letter-spacing: 3px; color: #1976d2;">${otp}</h3>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777;">
            © ${new Date().getFullYear()} Woxsen University. All rights reserved.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`OTP for ${email}: ${otp}`);
    }
    
    res.json({ 
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : null 
    });

  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
  }
});

// Verify OTP Endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const storedOtp = otpStorage.get(email);
    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    if (storedOtp.expiry < Date.now()) {
      otpStorage.delete(email);
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpStorage.delete(email);
    res.json({ message: 'OTP verified successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password Endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update password (stored in plain text - INSECURE)
    student.password = newPassword;
    await student.save();

    // Return success response
    res.json({ 
      success: true,
      message: 'Password reset successfully' 
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Password reset failed' 
    });
  }
});

module.exports = router;