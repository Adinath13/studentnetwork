import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { Calendar, MapPin, Clock, Trash2, Users, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import EventRegistrationsModal from '../components/Event/EventRegistrationsModal';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        type: 'webinar',
        bannerImage: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get('/events');
            setEvents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/events', newEvent);
            setShowModal(false);
            setNewEvent({ title: '', description: '', date: '', location: '', type: 'webinar', bannerImage: '' });
            fetchEvents();
        } catch (error) {
            console.error(error);
            alert('Error creating event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await axios.delete(`/events/${id}`);
            fetchEvents();
        } catch (error) {
            console.error(error);
            alert('Error deleting event');
        }
    };

    const handleRegister = async (id) => {
        try {
            await axios.put(`/events/${id}/register`);
            alert('Registered successfully!');
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.message || 'Error registering');
        }
    };

    const openRegistrations = (event) => {
        setSelectedEvent(event);
        setShowRegistrationsModal(true);
    };

    const canManageEvents = ['admin', 'tpo'].includes(user?.role);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Upcoming Events</h1>
                {['admin', 'alumni', 'tpo'].includes(user?.role) && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-md font-medium"
                    >
                        Create Event
                    </button>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Create New Event</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                className="w-full border p-2 rounded"
                                value={newEvent.title}
                                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="w-full border p-2 rounded"
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                required
                            />
                            <input
                                type="datetime-local"
                                className="w-full border p-2 rounded"
                                value={newEvent.date}
                                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Location"
                                className="w-full border p-2 rounded"
                                value={newEvent.location}
                                onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                required
                            />
                            <div className="space-y-1">
                                <label className="text-sm text-gray-600">Banner Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full border p-2 rounded"
                                        value={newEvent.bannerImage}
                                        onChange={e => setNewEvent({ ...newEvent, bannerImage: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Leave empty for default banner</p>
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
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <EventRegistrationsModal
                isOpen={showRegistrationsModal}
                onClose={() => setShowRegistrationsModal(false)}
                eventId={selectedEvent?._id}
                eventTitle={selectedEvent?.title}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <div key={event._id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col group">
                        <div className="h-48 bg-gray-200 w-full relative">
                            <img
                                src={event.bannerImage || event.bannerUrl || 'https://placehold.co/800x400?text=Event+Banner'}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                            {canManageEvents && (
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDeleteEvent(event._id)}
                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-sm"
                                        title="Delete Event"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-primary mb-2 capitalize">
                                    {event.type}
                                </span>
                                <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                                <p className="mt-2 text-base text-gray-500 line-clamp-3">{event.description}</p>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    {format(new Date(event.date), 'PPP p')}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    {event.location}
                                </div>
                                {canManageEvents && (
                                    <div className="flex items-center text-sm text-indigo-600 font-medium cursor-pointer hover:text-indigo-800" onClick={() => openRegistrations(event)}>
                                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                        {event.registrations?.length || event.attendees?.length || 0} Registered
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => handleRegister(event._id)}
                                    disabled={event.registrations?.some(r => r.user === user?._id) || event.attendees?.includes(user?._id)}
                                    className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${(event.registrations?.some(r => r.user === user?._id) || event.attendees?.includes(user?._id))
                                            ? 'bg-green-600 hover:bg-green-700 cursor-default'
                                            : 'bg-primary hover:bg-indigo-700'
                                        }`}
                                >
                                    {(event.registrations?.some(r => r.user === user?._id) || event.attendees?.includes(user?._id)) ? 'Registered' : 'Register Now'}
                                </button>
                                {canManageEvents && (
                                    <button
                                        onClick={() => openRegistrations(event)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Manage
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventsPage;
