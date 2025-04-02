const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Timetable Schema
const timetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['Spring', 'Summer', 'Fall', 'Winter']
  },
  classes: [{
    name: {
      type: String,
      required: true
    },
    section: {
      type: String,
      required: true
    },
    subjects: [{
      name: {
        type: String,
        required: true
      },
      faculty: {
        type: String,
        required: true
      },
      classesPerWeek: {
        type: Number,
        required: true,
        min: 1
      }
    }]
  }],
  schedule: {
    classView: {
      type: Map,
      of: Map
    },
    facultyView: {
      type: Map,
      of: Map
    },
    periods: [{
      name: String,
      time: String,
      start: Number,
      end: Number
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
timetableSchema.index({ academicYear: 1, semester: 1 });
timetableSchema.index({ 'classes.name': 1 });

// Middleware to update the updatedAt field
timetableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get timetable for a specific faculty
timetableSchema.methods.getFacultyTimetable = function(facultyName) {
  const facultyView = this.schedule.facultyView;
  
  if (!facultyView) return null;
  
  // Convert Map to object for easier handling
  const facultyTimetable = {};
  facultyView.forEach((daySchedule, day) => {
    facultyTimetable[day] = {};
    daySchedule.forEach((periodValue, period) => {
      facultyTimetable[day][period] = periodValue;
    });
  });
  
  return facultyTimetable;
};

// Method to get timetable for a specific class
timetableSchema.methods.getClassTimetable = function(className) {
  const classView = this.schedule.classView;
  if (!classView || !classView.get(className)) return null;
  
  // Convert Map to object for easier handling
  const classTimetable = {};
  classView.get(className).forEach((daySchedule, day) => {
    classTimetable[day] = {};
    daySchedule.forEach((periodValue, period) => {
      classTimetable[day][period] = periodValue;
    });
  });
  
  return classTimetable;
};

const Timetable = mongoose.model('Timetable', timetableSchema);

// Routes

// Create new timetable
router.post('/', async (req, res) => {
  try {
    const { name, academicYear, semester, classes, schedule } = req.body;
    
    // Validate input
    if (!name || !academicYear || !semester || !classes || !schedule) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Create new timetable
    const timetable = new Timetable({
      name,
      academicYear,
      semester,
      classes,
      schedule
    });
    
    await timetable.save();
    
    res.status(201).json(timetable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all timetables
router.get('/', async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.json({ timetables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get timetable by ID
router.get('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    res.json(timetable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get timetable for a specific faculty
router.get('/faculty/:facultyName', async (req, res) => {
  try {
    const timetables = await Timetable.find();
    
    if (!timetables || timetables.length === 0) {
      return res.status(404).json({ message: 'No timetables found' });
    }
    
    // Filter and format timetables for the faculty
    const facultyTimetables = timetables
      .map(timetable => {
        const facultyTimetable = timetable.getFacultyTimetable(req.params.facultyName);
        if (!facultyTimetable) return null;
        
        return {
          _id: timetable._id,
          name: timetable.name,
          academicYear: timetable.academicYear,
          semester: timetable.semester,
          schedule: facultyTimetable,
          periods: timetable.schedule.periods
        };
      })
      .filter(t => t !== null);
    
    if (facultyTimetables.length === 0) {
      return res.status(404).json({ message: 'No timetables found for this faculty' });
    }
    
    res.json({ timetables: facultyTimetables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get timetable for a specific class
router.get('/class/:className', async (req, res) => {
  try {
    const timetables = await Timetable.find({
      'classes.name': req.params.className
    });
    
    if (!timetables || timetables.length === 0) {
      return res.status(404).json({ message: 'No timetables found for this class' });
    }
    
    // Format response to show only relevant data for the class
    const formattedTimetables = timetables.map(timetable => {
      const classTimetable = timetable.getClassTimetable(req.params.className);
      
      return {
        _id: timetable._id,
        name: timetable.name,
        academicYear: timetable.academicYear,
        semester: timetable.semester,
        schedule: classTimetable,
        periods: timetable.schedule.periods
      };
    });
    
    res.json({ timetables: formattedTimetables });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload timetable (bulk create)
router.post('/upload', async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Expected an array of timetables' });
    }
    
    const result = await Timetable.insertMany(req.body);
    res.status(201).json({ count: result.length, timetables: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update timetable
router.put('/:id', async (req, res) => {
  try {
    const { name, academicYear, semester, classes, schedule } = req.body;
    
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    // Update fields
    timetable.name = name || timetable.name;
    timetable.academicYear = academicYear || timetable.academicYear;
    timetable.semester = semester || timetable.semester;
    timetable.classes = classes || timetable.classes;
    timetable.schedule = schedule || timetable.schedule;
    
    await timetable.save();
    
    res.json(timetable);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete timetable
router.delete('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    
    await timetable.remove();
    res.json({ message: 'Timetable deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;