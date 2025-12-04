import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Modal from '../Modal';
import { ExternalLink } from 'lucide-react';

const JobApplicationsModal = ({ isOpen, onClose, jobId, jobTitle }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && jobId) {
            fetchApplications();
        }
    }, [isOpen, jobId]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/jobs/${jobId}/applications`);
            setApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Applications: ${jobTitle}`} size="lg">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Total Applications: {applications.length}</h3>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No applications yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.map((app) => (
                                    <tr key={app._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {app.student?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {app.student?.email || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                                            {app.resumeLink ? (
                                                <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                                                    View Resume <ExternalLink size={14} />
                                                </a>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(app.appliedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default JobApplicationsModal;
