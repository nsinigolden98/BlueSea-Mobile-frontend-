import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Camera, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    surname: user?.surname || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    // Save profile logic here
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const profileFields = [
    { id: 'fullName', label: 'Full Name', value: `${formData.firstName} ${formData.surname}`, editable: true },
    { id: 'phone', label: 'Mobile Number', value: formData.phone, editable: true },
    { id: 'email', label: 'Email', value: formData.email, editable: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">My Profile</h1>
      </div>

      <main className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-600 dark:text-slate-300">
                  {user?.firstName?.[0]}{user?.surname?.[0]}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Profile Picture</p>
          </div>

          {/* Profile Fields */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
            {isEditing ? (
              <div className="p-4 space-y-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Surname</Label>
                  <Input
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-sky-500 hover:bg-sky-600"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              profileFields.map((field, index) => (
                <button
                  key={field.id}
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                    index !== profileFields.length - 1 && 'border-b border-slate-100 dark:border-slate-800'
                  )}
                >
                  <div className="text-left">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{field.label}</p>
                    <p className="font-medium text-slate-800 dark:text-white">{field.value || 'Not set'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              ))
            )}
          </div>

          {!isEditing && (
            <Button 
              className="w-full bg-sky-500 hover:bg-sky-600"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
