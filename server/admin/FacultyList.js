const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Faculty Schema
const facultySchema = new mongoose.Schema({
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
        return /^[^\s@]+@woxsen\.edu\.in$/i.test(v);
      },
      message: props => `${props.value} is not a valid Woxsen email!`
    },
    required: true
  },
  employeeId: { 
    type: String, 
    required: true,
    unique: true
  },
  school: {
    type: String,
    required: true,
    enum: ['SOA', 'SOH', 'SOT', 'SOL', 'SOM', 'SOD']
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
  role: {
    type: String,
    required: true,
    default: 'faculty',
    enum: ['faculty', 'admin', 'hod']
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Pre-save hook to generate email (password remains plain text)
facultySchema.pre('save', function(next) {
  if (!this.email) {
    this.email = `${this.firstName.toLowerCase()}.${this.lastName.toLowerCase()}@woxsen.edu.in`;
  }
  next();
});

const Faculty = mongoose.model('Faculty', facultySchema);

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

const isAdminUser = (email, password) => {
  const admins = [
    { email: 'admin1@woxsen.edu.in', password: 'admin123' },
    { email: 'admin2@woxsen.edu.in', password: 'admin456' }
  ];
  
  return admins.some(admin => 
    admin.email === email && admin.password === password
  );
};

// Modified login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email format
    if (!/^[^\s@]+@woxsen\.edu\.in$/i.test(email)) {
      return res.status(400).json({ message: 'Only Woxsen email addresses are allowed' });
    }

    // Check if it's an admin user
    if (isAdminUser(email, password)) {
      // Create admin token
      const token = jwt.sign(
        { 
          id: 'admin-' + email.split('@')[0],
          email: email,
          role: 'admin'  // Explicitly set role to admin
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({ 
        message: 'Admin login successful',
        token,
        user: { email, role: 'admin' }
      });
    }

    // Regular faculty login flow
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (password !== faculty.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: faculty._id, 
        email: faculty.email,
        role: faculty.role || 'faculty'  // Default to faculty if no role set
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const facultyResponse = faculty.toObject();
    delete facultyResponse.password;

    res.json({ 
      message: 'Login successful',
      token,
      faculty: facultyResponse
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Get All Faculty
router.get('/', async (req, res) => {
  try {
    const faculty = await Faculty.find().select('-password').sort({ createdAt: -1 });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new faculty
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, employeeId, school, phone, address, role } = req.body;
    
    // Default password is employeeId (stored in plain text)
    const password = employeeId;

    // Check if employeeId already exists
    const existingEmployee = await Faculty.findOne({ employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await Faculty.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const faculty = new Faculty({
      firstName,
      lastName,
      email,
      employeeId,
      school,
      phone,
      address,
      role,
      password
    });

    const newFaculty = await faculty.save();
    
    // Remove password from response
    const facultyResponse = newFaculty.toObject();
    delete facultyResponse.password;
    
    res.status(201).json(facultyResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update faculty
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, employeeId, school, phone, address, role } = req.body;

    // Check if employeeId exists for another faculty
    const existingEmployee = await Faculty.findOne({ 
      employeeId,
      _id: { $ne: id }
    });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists for another faculty' });
    }

    // Check if email exists for another faculty
    const existingEmail = await Faculty.findOne({ 
      email,
      _id: { $ne: id }
    });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists for another faculty' });
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { firstName, lastName, email, employeeId, school, phone, address, role },
      { new: true }
    ).select('-password');

    if (!updatedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json(updatedFaculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete faculty
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFaculty = await Faculty.findByIdAndDelete(id);

    if (!deletedFaculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    res.json({ message: 'Faculty deleted successfully' });
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

    if (!/^[a-zA-Z0-9._-]+@woxsen\.edu\.in$/i.test(email)) {
      return res.status(400).json({ message: 'Only Woxsen email addresses are allowed' });
    }

    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty email not found' });
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
    
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
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

    // Find faculty by email
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Update password (stored in plain text - INSECURE)
    faculty.password = newPassword;
    await faculty.save();

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