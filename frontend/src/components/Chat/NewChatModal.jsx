import { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import axios from '../../utils/axios';
import { Search } from 'lucide-react';
import Modal from '../Modal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NewChatModal = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const { createConversation } = useChat();

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/chat/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = (userId) => {
        createConversation(userId);
        onClose();
        setSearchTerm('');
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Start New Chat" size="md">
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No users found</p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                    onClick={() => handleStartChat(user._id)}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.profilePicture} alt={user.name} />
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                                        <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default NewChatModal;
