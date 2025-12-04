const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        res.json(jobs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Alumni/TPO/Admin)
const createJob = async (req, res) => {
    try {
        const { title, company, location, type, description, requirements, applicationLink, deadline } = req.body;

        const newJob = new Job({
            title,
            company,
            location,
            type,
            description,
            requirements,
            applicationLink,
            deadline,
            postedBy: req.user.id
        });
        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Owner/Admin)
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'tpo') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Apply for job
// @route   POST /api/jobs/:id/apply
// @access  Private (Student)
const applyForJob = async (req, res) => {
    try {
        const { resumeLink } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check deadline
        if (job.deadline && new Date() > new Date(job.deadline)) {
            return res.status(400).json({ message: 'Job application deadline has passed' });
        }

        // Check if already applied
        const alreadyApplied = job.applications.some(
            app => app.student.toString() === req.user.id
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied for this job' });
        }

        job.applications.push({
            student: req.user.id,
            resumeLink
        });

        await job.save();
        res.json(job.applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get job applications
// @route   GET /api/jobs/:id/applications
// @access  Private (Owner/Admin/TPO)
const getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('applications.student', 'name email role');
        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check authorization
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'tpo') {
            return res.status(401).json({ message: 'Not authorized to view applications' });
        }

        res.json(job.applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getJobs,
    createJob,
    deleteJob,
    applyForJob,
    getJobApplications
};
