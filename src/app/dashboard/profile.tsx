"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { FiUser, FiBook, FiAward, FiDownload, FiCamera, FiTrash2 } from "react-icons/fi";

interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  matricNumber: string;
  sex: string;
  department: string;
  faculty: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  examDate?: string | null;
}

interface Activity {
  id: string;
  type: "download" | "quiz" | "gpa";
  title: string;
  timestamp: string;
  details: string;
}

export default function Profile({ token }: { token?: string }) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    matricNumber: "",
    sex: "",
    department: "",
    faculty: "",
    examDate: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchActivities();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile with token:', token ? 'Token exists' : 'No token');
      const response = await fetch("/api/profile", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      console.log('Profile response:', data);
      
      if (response.ok) {
        setProfile(data.profile);
        if (data.profile) {
          setFormData({
            fullName: data.profile.fullName || "",
            matricNumber: data.profile.matricNumber || "",
            sex: data.profile.sex || "",
            department: data.profile.department || "",
            faculty: data.profile.faculty || "",
            examDate: data.profile.examDate || "",
          });
          setAvatarPreview(data.profile.avatarUrl || null);
        }
      } else {
        console.error("Error fetching profile:", data.error);
        alert(`Error fetching profile: ${data.error}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert(`Error fetching profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected (e.g., user cancels file dialog), 
      // keep existing or clear preview if appropriate
      // For now, if they had an existing avatar and cancel, it remains.
      // If they clear the selection after picking a new one, reset to original or clear.
      // This part can be refined based on desired UX.
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setAvatarPreview(profile?.avatarUrl || null); // Reset to original or null if no original
    // To actually delete from DB, you'd need to send a specific flag/empty value for avatar_url in handleSubmit
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");

    const submissionFormData = new FormData();
    submissionFormData.append("fullName", formData.fullName);
    submissionFormData.append("matricNumber", formData.matricNumber);
    submissionFormData.append("sex", formData.sex);
    submissionFormData.append("department", formData.department);
    submissionFormData.append("faculty", formData.faculty);
    submissionFormData.append("examDate", formData.examDate);

    if (selectedFile) {
      submissionFormData.append("avatar", selectedFile);
    } else if (avatarPreview === null && profile?.avatarUrl) {
      // This condition means the user explicitly removed an existing avatar 
      // and didn't select a new one. We send an empty string or a specific flag 
      // to tell the backend to delete the avatar_url.
      submissionFormData.append("avatar_url", ""); // Signal to remove avatar
    }

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submissionFormData,
      });
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.profile);
        setEditing(false);
        setSaveStatus("success");
        setSelectedFile(null); // Clear selected file after successful upload
        if(data.profile?.avatarUrl) {
          setAvatarPreview(data.profile.avatarUrl); // Update preview with new URL from server
        } else {
          setAvatarPreview(null); // If server removed it
        }
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        const errorMessage = data.error || "Error updating profile. Please try again.";
        alert(errorMessage);
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("error");
      alert("Network error. Please check your connection and try again.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {editing ? (
        // EDITING MODE: Form spans full width
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3"><FiUser />Edit Profile</h2>
                <button
                    onClick={() => {
                    setEditing(false);
                    if (profile) {
                        setFormData({
                        fullName: profile.fullName || "",
                        matricNumber: profile.matricNumber || "",
                        sex: profile.sex || "",
                        department: profile.department || "",
                        faculty: profile.faculty || "",
                        examDate: profile.examDate || "",
                        });
                        setAvatarPreview(profile.avatarUrl || null);
                    }
                    setSelectedFile(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center space-y-3 mb-6">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300 relative group shadow-sm">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                        <FiUser className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                    )}
                    <label 
                        htmlFor="avatarUpload"
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                    >
                        <FiCamera size={24} />
                        <span className="mt-1 text-xs">Change Photo</span>
                    </label>
                    </div>
                    <input type="file" id="avatarUpload" name="avatar" accept="image/png, image/jpeg, image/gif" onChange={handleFileChange} className="hidden" />
                    {avatarPreview && (
                    <button type="button" onClick={handleRemoveAvatar} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                        <FiTrash2 /> Remove
                    </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label><input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Sex</label><select name="sex" value={formData.sex} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500" required><option value="">Select Sex</option><option value="male">Male</option><option value="female">Female</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500" required /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label><input type="text" name="faculty" value={formData.faculty} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500" required /></div>
                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Input the date your exam would start</label><input type="date" name="examDate" value={formData.examDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500" /></div>
                </div>
                <div className="flex items-center gap-4 pt-4">
                    <button type="submit" disabled={saveStatus === "saving"} className={`w-full bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium ${saveStatus === "saving" ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"} transition-colors`}>
                    {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                    </button>
                    {saveStatus === "success" && <span className="text-sm text-green-600">Profile updated!</span>}
                    {saveStatus === "error" && <span className="text-sm text-red-600">Update error.</span>}
                </div>
            </form>
          </div>
        </div>
      ) : (
        // VIEW MODE: Profile card (avatar + details) and Activities card
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Student Profile Card (includes avatar and details) */}
          <div className="lg:col-span-2">
            {profile ? (
                <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 pb-6 border-b border-gray-200">
                        {/* Avatar */} 
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-gray-300 shadow-md">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <FiUser className="w-16 h-16 text-gray-400" />
                            )}
                        </div>
                        {/* Name and Edit Button */} 
                        <div className="flex-grow text-center sm:text-left">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{profile.fullName || "Student Name"}</h2>
                            <p className="text-sm text-gray-500">{profile.department || "Department"} - {profile.faculty || "Faculty"}</p>
                            <button
                                onClick={() => setEditing(true)}
                                className="mt-3 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                    {/* Profile Details */} 
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div><p className="font-medium text-gray-500">Matric Number</p><p className="text-gray-700">{profile.matricNumber || "-"}</p></div>
                            <div><p className="font-medium text-gray-500">Sex</p><p className="text-gray-700 capitalize">{profile.sex || "-"}</p></div>
                            <div><p className="font-medium text-gray-500">Email Address</p><p className="text-gray-700">{profile.email}</p></div>
                            {profile.updatedAt && <div className="sm:col-span-2"><p className="font-medium text-gray-500">Last Updated</p><p className="text-gray-700">{new Date(profile.updatedAt).toLocaleString()}</p></div>}
                            {profile.examDate && <div className="sm:col-span-2"><p className="font-medium text-gray-500">Exam Start Date</p><p className="text-gray-700">{new Date(profile.examDate).toLocaleDateString()}</p></div>}
                        </div>
                    </div>
              </div>
            ) : (
                <div className="lg:col-span-2 bg-white rounded-lg shadow-xl p-8 text-center">
                    <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-5 text-lg">Student profile not available.</p>
                    <button 
                        onClick={() => setEditing(true)} 
                        className="px-6 py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium">
                        Set Up Profile
                    </button>
                </div>
            )}
          </div>

          {/* Recent Activities Card */}
          <div className="lg:col-span-1">
            {profile && activities.length > 0 && (
                 <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 h-full">
                    <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2"><FiAward className="text-yellow-500" />Recent Activities</h2>
                    <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                            <div className="flex items-start gap-3">
                                {activity.type === "download" && <FiDownload className="mt-1 text-blue-500 flex-shrink-0" />}
                                {activity.type === "quiz" && <FiBook className="mt-1 text-purple-500 flex-shrink-0" />}
                                {activity.type === "gpa" && <FiAward className="mt-1 text-green-500 flex-shrink-0" />}
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-700 text-sm">{activity.title}</p>
                                    <p className="text-xs text-gray-500">{activity.details}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(activity.timestamp).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            )}
            {profile && activities.length === 0 && (
                 <div className="bg-white rounded-lg shadow-xl p-8 text-center h-full flex flex-col justify-center items-center">
                    <FiAward className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent activities to display.</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 