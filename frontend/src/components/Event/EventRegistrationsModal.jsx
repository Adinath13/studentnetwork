import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import Modal from '../Modal';
import { X, Mail } from 'lucide-react';

const EventRegistrationsModal = ({ isOpen, onClose, eventId, eventTitle }) => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && eventId) {
            fetchRegistrations();
        }
    }, [isOpen, eventId]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/events/${eventId}/registrations`);
            setRegistrations(data);
        } catch (error) {
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async () => {
        // Placeholder for notification logic
        alert('Notification feature coming soon!');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Registrations: ${eventTitle}`} size="lg">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Total Registered: {registrations.length}</h3>
                    <button
                        onClick={handleSendNotification}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                    >
                        <Mail size={16} />
                        Send Notification
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : registrations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No registrations yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registrations.map((reg) => (
                                    <tr key={reg._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {reg.user?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {reg.user?.email || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {reg.user?.role || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(reg.registeredAt).toLocaleDateString()}
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

export default EventRegistrationsModal;
