import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import Avatar from '../ui/Avatar';

const UserProfile = ({ user }) => {
    if (!user) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24"></div>
            <div className="px-6 pb-6">
                <div className="relative -top-10 mb-[-2.5rem]">
                    <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md inline-block overflow-hidden">
                        <Avatar 
                            src={user.avatarUrl} 
                            alt={user.name?.first || 'User'} 
                            className="w-full h-full"
                        />
                    </div>
                </div>
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-gray-800">
                        {user.name?.first} {user.name?.last}
                    </h2>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1 capitalize">
                        {user.role || 'Patient'}
                    </span>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-3" />
                        {user.email}
                    </div>
                    {user.phone && (
                        <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="w-4 h-4 mr-3" />
                            {user.phone}
                        </div>
                    )}
                    {(user.location || user.address?.city) && (
                        <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-3" />
                            {user.location || user.address.city}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
