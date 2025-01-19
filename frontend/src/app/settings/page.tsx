// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/lib/auth/AuthContext';
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const router = useRouter();
  const { user, logout } = useAuth();

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: LogOut },
  ];


  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
      const checkAuth = async () => {
        try {
          
    
          if (!localStorage.getItem('token')) {
            router.push('/');
          }
        } catch{
          console.log('error');
        }
      }
      checkAuth();
    }, [router]);

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
    
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
    
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
    
          const { user } = await response.json();  // Destructure the user from response
          setFormData({
            username: user.username || '',
            email: user.email || '',
            bio: user.bio || ''
          });
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load user data');
          setTimeout(() => {
            setError('');
          }, 3000);
        }
      };
    
      fetchUserData();
    }, []); // Empty dependency array means this runs once when component mounts
    
    // Add these state variables for password fields
const [passwordData, setPasswordData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Add a new handler for password updates
const handleUpdatePassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setSuccess('');

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    setError('New passwords do not match');
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword  // This will be the new password
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update password');
    }

    setSuccess('Password updated successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setTimeout(() => {
      setSuccess('');
    }, 3000);

  } catch (err) {
    console.error('Password update error:', err);
    setError(err instanceof Error ? err.message : 'Failed to update password');
    setTimeout(() => {
      setError('');
    }, 3000);
  } finally {
    setIsLoading(false);
  }
};
  
    const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
      setSuccess('');
    
      try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        });
    
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
    
        const updateData = await response.json();
        setFormData(updateData);
    
        // Update the user data in localStorage
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = {
          ...currentUserData,
          ...updateData  // or specifically update bio: formData.bio if you prefer
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
    
        setSuccess('Profile updated successfully');
    
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        setTimeout(() => {
          setError('');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };


  return (
    <AuthProvider>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-lg ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`mr-3 h-5 w-5 ${
                        activeSection === section.id
                          ? 'text-blue-700'
                          : 'text-gray-400'
                      }`} />
                      {section.label}
                    </div>
                    <ChevronRight className={`h-4 w-4 ${
                      activeSection === section.id
                        ? 'text-blue-700'
                        : 'text-gray-400'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm p-8">
          {activeSection === 'profile' && (
  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Settings</h3>
    {error && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
        {error}
      </div>
    )}
    {success && (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
        {success}
      </div>
    )}
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 pl-4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 pl-4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 pl-4"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
)}

            {activeSection === 'billing' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Billing Settings</h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900">Current Plan</h4>
                    <p className="text-sm text-gray-500">Free Plan</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900">Payment Method</h4>
                    <p className="text-sm text-gray-500">No payment method added</p>
                    <button className="mt-2 text-blue-600 text-sm hover:text-blue-700">
                      Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {['Email notifications', 'Push notifications', 'SMS notifications'].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

{activeSection === 'security' && (
  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-8">Security Settings</h3> {/* Increased margin bottom */}
    <div className="space-y-8"> {/* Increased space between sections */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-6">Change Password</h4> {/* Increased margin bottom */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
            {success}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleUpdatePassword}> {/* Increased space between form elements */}
          <div className="space-y-2"> {/* Added container with spacing for label and input */}
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="mt-1 block w-3/4 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="mt-1 block w-3/4 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="mt-1 block w-3/4 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end mt-8"> {/* Increased top margin */}
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
      <div className="mt-8"> {/* Increased top margin */}
        <h4 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
        <button className="text-blue-600 text-sm hover:text-blue-700">
          Enable Two-Factor Authentication
        </button>
      </div>
    </div>
  </div>
)}
            {activeSection === 'account' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Account Settings</h3>
                <div className="space-y-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800">Danger Zone</h4>
                    <p className="mt-1 text-sm text-red-600">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Logout
                      </button>
                      <button
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </AuthProvider>
  );
};

export default SettingsPage;