import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Briefcase, MapPin, Building, Clock, Trash2, Users, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import JobApplicationsModal from '../components/Job/JobApplicationsModal';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [newJob, setNewJob] = useState({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        description: '',
        requirements: '',
        applicationLink: '',
        deadline: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await axios.get('/jobs');
            setJobs(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/jobs', newJob);
            setShowModal(false);
            setNewJob({
                title: '',
                company: '',
                location: '',
                type: 'full-time',
                description: '',
                requirements: '',
                applicationLink: '',
                deadline: ''
            });
            fetchJobs();
        } catch (error) {
            console.error(error);
            alert('Error creating job');
        }
    };

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await axios.delete(`/jobs/${id}`);
            fetchJobs();
        } catch (error) {
            console.error(error);
            alert('Error deleting job');
        }
    };

    const handleApply = async (job) => {
        if (job.applicationLink) {
            window.open(job.applicationLink, '_blank');
            return;
        }

        const resumeLink = prompt('Please enter a link to your resume (Google Drive, LinkedIn, etc.):');
        if (!resumeLink) return;

        try {
            await axios.post(`/jobs/${job._id}/apply`, { resumeLink });
            alert('Applied successfully!');
            fetchJobs();
        } catch (error) {
            alert(error.response?.data?.message || 'Error applying');
        }
    };

    const openApplications = (job) => {
        setSelectedJob(job);
        setShowApplicationsModal(true);
    };

    const canManageJob = (job) => {
        return ['admin', 'tpo'].includes(user?.role) || (user?.role === 'alumni' && job.postedBy?._id === user?._id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Job Board</h1>
                {['admin', 'alumni', 'tpo'].includes(user?.role) && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-md font-medium"
                    >
                        Post Job
                    </button>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Post New Job</h2>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Job Title"
                                className="w-full border p-2 rounded"
                                value={newJob.title}
                                onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Company"
                                className="w-full border p-2 rounded"
                                value={newJob.company}
                                onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-full border p-2 rounded"
                                value={newJob.location}
                                onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                required
                            />
                            <select
                                className="w-full border p-2 rounded"
                                value={newJob.type}
                                onChange={e => setNewJob({ ...newJob, type: e.target.value })}
                            >
                                <option value="full-time">Full Time</option>
                                <option value="part-time">Part Time</option>
                                <option value="internship">Internship</option>
                                <option value="contract">Contract</option>
                            </select>
                            <textarea
                                placeholder="Description"
                                className="w-full border p-2 rounded"
                                value={newJob.description}
                                onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                required
                            />
                            <div className="space-y-1">
                                <label className="text-sm text-gray-600">Application Deadline</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded"
                                    value={newJob.deadline}
                                    onChange={e => setNewJob({ ...newJob, deadline: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-gray-600">External Application Link (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://company.com/careers"
                                    className="w-full border p-2 rounded"
                                    value={newJob.applicationLink}
                                    onChange={e => setNewJob({ ...newJob, applicationLink: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-indigo-700"
                                >
                                    Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <JobApplicationsModal
                isOpen={showApplicationsModal}
                onClose={() => setShowApplicationsModal(false)}
                jobId={selectedJob?._id}
                jobTitle={selectedJob?.title}
            />

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {jobs.map((job) => (
                        <li key={job._id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <p className="text-lg font-medium text-primary truncate">{job.title}</p>
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                                            {job.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canManageJob(job) && (
                                            <>
                                                <button
                                                    onClick={() => openApplications(job)}
                                                    className="p-1 text-indigo-600 hover:text-indigo-900"
                                                    title="View Applications"
                                                >
                                                    <Users size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteJob(job._id)}
                                                    className="p-1 text-red-600 hover:text-red-900"
                                                    title="Delete Job"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex flex-col gap-1">
                                        <p className="flex items-center text-sm text-gray-500">
                                            <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            {job.company}
                                        </p>
                                        <p className="flex items-center text-sm text-gray-500">
                                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            {job.location}
                                        </p>
                                        {job.deadline && (
                                            <p className="flex items-center text-sm text-red-500">
                                                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-red-400" />
                                                Deadline: {format(new Date(job.deadline), 'PPP')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 flex-col items-end gap-2">
                                        <p>
                                            Posted by {job.postedBy?.name}
                                        </p>
                                        {user?.role === 'student' && (
                                            <button
                                                onClick={() => handleApply(job)}
                                                disabled={job.applications?.some(app => app.student === user?._id)}
                                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${job.applications?.some(app => app.student === user?._id)
                                                        ? 'bg-green-600 cursor-default'
                                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                                    }`}
                                            >
                                                {job.applications?.some(app => app.student === user?._id) ? 'Applied' : 'Apply Now'}
                                                {job.applicationLink && <ExternalLink size={12} className="ml-1" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default JobsPage;
