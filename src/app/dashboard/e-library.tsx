"use client";
import { useState, useEffect } from "react";
import { FiUpload, FiSearch, FiFilter, FiDownload, FiLogIn, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";

type Material = {
  id: string;
  material_id: string;
  title: string;
  type: "pdf" | "doc" | "video";
  courseTitle: string;
  department: string;
  level: string;
  fileUrl: string;
  uploadDate: string;
};

type ELibraryProps = {
  token?: string;
};

export default function ELibrary({ token }: ELibraryProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [filters, setFilters] = useState({
    courseTitle: "",
    department: "",
    level: "",
    type: "",
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (token) fetchMaterials(token);
    // Check for Google access token in localStorage
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('google_access_token') : null;
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('google_email') : null;
    if (storedToken) setGoogleToken(storedToken);
    if (storedEmail) setGoogleEmail(storedEmail);

    // Check for token/email in URL (after OAuth)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const accessToken = url.searchParams.get('google_access_token');
      const email = url.searchParams.get('google_email');
      if (accessToken) {
        localStorage.setItem('google_access_token', accessToken);
        setGoogleToken(accessToken);
      }
      if (email) {
        localStorage.setItem('google_email', email);
        setGoogleEmail(email);
      }
      // Clean up URL
      if (accessToken || email) {
        url.searchParams.delete('google_access_token');
        url.searchParams.delete('google_email');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }
  }, [token]);

  useEffect(() => {
    if (googleToken) {
      fetchGoogleDriveFiles();
    } else if (token) {
      fetchMaterials(token);
    }
  }, [token, googleToken]);

  async function fetchMaterials(t: string) {
    const res = await fetch("/api/materials", {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMaterials(data.materials.map((material: any) => ({
        id: material.id,
        material_id: material.material_id,
        title: material.material_title,
        type: material.material_title.toLowerCase().endsWith('.pdf') ? 'pdf' : 
              material.material_title.toLowerCase().endsWith('.doc') || material.material_title.toLowerCase().endsWith('.docx') ? 'doc' : 'video',
        courseTitle: material.course_title,
        department: material.department,
        level: material.level,
        fileUrl: material.file_url,
        uploadDate: material.created_at
      })));
    }
  }

  async function fetchGoogleDriveFiles() {
    try {
      const res = await fetch(
        "https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,createdTime,webViewLink,webContentLink)",
        {
          headers: { Authorization: `Bearer ${googleToken}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // Map Google Drive files to Material type for display
        setMaterials(
          data.files.map((file: any) => ({
            id: file.id,
            title: file.name,
            type: file.mimeType.includes('pdf') ? 'pdf' : file.mimeType.includes('video') ? 'video' : 'doc',
            courseTitle: '',
            department: '',
            level: '',
            fileUrl: file.webContentLink || `https://drive.google.com/uc?id=${file.id}&export=download`,
            uploadDate: file.createdTime,
          }))
        );
      }
    } catch (error) {
      setMessage('Error fetching Google Drive files');
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
    setMessage("");

    if (googleToken) {
      // Upload to Google Drive
      try {
        const metadata = {
          name: file.name,
          mimeType: file.type,
        };
        const form = new FormData();
        form.append(
          "metadata",
          new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        form.append("file", file);
        const res = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${googleToken}`,
            },
            body: form,
          }
        );
        const data = await res.json();
        if (res.ok) {
          setMessage("File uploaded to Google Drive!");
          // Optionally, refresh the file list here
        } else {
          setMessage(data.error?.message || "Error uploading to Google Drive");
        }
      } catch (error) {
        setMessage("Error uploading to Google Drive");
      } finally {
        setUploading(false);
      }
      return;
    }

    // Fallback: upload to backend
    if (!token) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("courseTitle", filters.courseTitle);
    formData.append("department", filters.department);
    formData.append("level", filters.level);

    try {
      const res = await fetch("/api/materials/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMaterials([...materials, data.material]);
        setMessage("File uploaded successfully!");
      } else {
        setMessage(data.error || "Error uploading file");
      }
    } catch (error) {
      setMessage("Error uploading file");
    } finally {
      setUploading(false);
    }
  }

  // Start Google OAuth flow
  const handleGoogleSignIn = () => {
    // Log the current environment
    console.log('Current environment:', {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      windowLocation: window.location.href,
      windowOrigin: window.location.origin,
    });

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
    
    // Detailed environment variable logging
    console.log('OAuth Configuration:', {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID: clientId,
      redirectUri: redirectUri,
      fullUrl: window.location.href,
    });
    
    if (!clientId) {
      console.error('Google Drive Client ID is missing!');
      return;
    }
    
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL is missing!');
      return;
    }

    // Log the exact redirect URI that will be sent to Google
    console.log('Redirect URI being sent to Google:', redirectUri);
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
      access_type: 'offline',
      prompt: 'consent',
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('Complete OAuth URL:', authUrl);
    window.location.href = authUrl;
  };

  // Sign out from Google Drive
  const handleGoogleSignOut = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_email');
    setGoogleToken(null);
    setGoogleEmail(null);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFormat = true;
    if (selectedFormat) {
      const ext = material.title.split('.').pop()?.toLowerCase();
      if (selectedFormat === 'pdf' && ext !== 'pdf') matchesFormat = false;
      if (selectedFormat === 'docx' && ext !== 'docx') matchesFormat = false;
      if (selectedFormat === 'jpeg' && ext !== 'jpeg' && ext !== 'jpg') matchesFormat = false;
      if (selectedFormat === 'png' && ext !== 'png') matchesFormat = false;
      if (selectedFormat === 'mp3' && ext !== 'mp3') matchesFormat = false;
      if (selectedFormat === 'mp4' && ext !== 'mp4') matchesFormat = false;
    }
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">E-Library</h2>
      
      {/* Google Drive Auth Section */}
      <div className="mb-6 flex items-center gap-4">
        {!googleToken ? (
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            <FiLogIn /> Sign in with Google Drive
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">Signed in as {googleEmail || 'Google User'}</span>
            <button
              onClick={handleGoogleSignOut}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              <FiLogOut /> Sign out
            </button>
          </div>
        )}
      </div>
      
      {/* Upload Section */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Upload Study Material</h3>
        <div className="flex gap-4 items-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.mp4"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
          >
            <FiUpload />
            {uploading ? "Uploading..." : "Upload File"}
          </label>
        </div>
      </div>

      {/* Search and Group Section */}
      <div className="mb-6">
        <div className="flex gap-4 mb-4 items-center">
          <div className="flex-1 relative flex items-center">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSearchTerm(searchInput); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          <button
              onClick={() => setSearchTerm(searchInput)}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
              Search
          </button>
        </div>
          <select
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className="border rounded-lg p-2 ml-2 min-w-[120px]"
          >
            <option value="">All Formats</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="mp3">MP3</option>
            <option value="mp4">MP4</option>
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div className="grid gap-2 sm:gap-4">
        {filteredMaterials.map((material) => (
          <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{material.title}</h3>
                <p className="text-sm text-gray-600">
                  {material.courseTitle || (googleToken ? 'Google Drive' : '')} {material.department && `• ${material.department}`} {material.level && `• Level ${material.level}`}
                </p>
              </div>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
              >
                <FiDownload />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className={`mt-4 p-2 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}
    </div>
  );
} 