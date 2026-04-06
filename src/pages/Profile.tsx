import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { postFileRequest, ENDPOINTS } from '@/types';
import { Loader } from '@/components/ui-custom';

export function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture || null);
  const { LoaderComponent } = Loader();
  
  const [formData] = useState({
    firstName: user?.firstName || '',
    surname: user?.surname || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const response = await postFileRequest(ENDPOINTS.user, formDataToSend);
      
      if (response) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploading(false);
    }
  };

  const profileFields = [
    { id: 'fullName', label: 'Full Name', value: `${formData.firstName} ${formData.surname}`, editable: false },
    { id: 'phone', label: 'Mobile Number', value: formData.phone, editable: false },
    { id: 'email', label: 'Email', value: formData.email, editable: false },
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
              {imagePreview || user?.profilePicture ? (
                <img 
                  src={imagePreview || user?.profilePicture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-600 dark:text-slate-300">
                    {user?.firstName?.[0]}{user?.surname?.[0]}
                  </span>
                </div>
              )}
              <button 
                onClick={handleImageClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Upload className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Tap camera to change profile picture</p>
          </div>

          {/* Profile Fields - Read Only */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-6">
            {profileFields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  'flex items-center justify-between p-4',
                  index !== profileFields.length - 1 && 'border-b border-slate-100 dark:border-slate-800'
                )}
              >
                <div className="text-left">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{field.label}</p>
                  <p className="font-medium text-slate-800 dark:text-white">{field.value || 'Not set'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
