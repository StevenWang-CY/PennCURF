'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, StudentProfile, StudentProfileCreate } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const YEAR_OPTIONS = ['First-year', 'Sophomore', 'Junior', 'Senior'];

const SKILL_OPTIONS = [
  'Python', 'R', 'MATLAB', 'Java', 'JavaScript', 'C/C++', 'SQL',
  'Machine Learning', 'Data Analysis', 'Statistical Analysis',
  'Lab Techniques', 'Cell Culture', 'PCR', 'Western Blot',
  'Scientific Writing', 'Literature Review', 'Grant Writing',
  'Project Management', 'Communication', 'Teamwork',
];

const INTEREST_OPTIONS = [
  'Artificial Intelligence', 'Machine Learning', 'Data Science',
  'Neuroscience', 'Psychology', 'Cognitive Science',
  'Biology', 'Chemistry', 'Physics', 'Mathematics',
  'Public Health', 'Epidemiology', 'Healthcare',
  'Economics', 'Finance', 'Business',
  'Political Science', 'Sociology', 'Anthropology',
  'Environmental Science', 'Climate Change', 'Sustainability',
  'Engineering', 'Robotics', 'Computer Science',
  'Medicine', 'Biomedical Research', 'Pharmaceuticals',
  'Arts', 'Humanities', 'History', 'Philosophy',
];

function ProfileContent() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { setProfileId } = useProfile();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<StudentProfile | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState<StudentProfileCreate>({
    name: '',
    email: '',
    year: '',
    major: '',
    academic_interests: [],
    career_interests: [],
    skills: [],
    experience: '',
    resume_text: '',
  });

  // Load existing profile
  useEffect(() => {
    if (user?.has_profile) {
      api.getMyProfile()
        .then(profile => {
          setExistingProfile(profile);
          setFormData({
            name: profile.name,
            email: profile.email || '',
            year: profile.year,
            major: profile.major || '',
            academic_interests: profile.academic_interests || [],
            career_interests: profile.career_interests || [],
            skills: profile.skills || [],
            experience: profile.experience || '',
            resume_text: profile.resume_text || '',
          });
        })
        .catch(err => {
          console.error('Error loading profile:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Calculate profile completion
  const calculateCompletion = () => {
    let completed = 0;
    const total = 7;

    if (formData.name) completed++;
    if (formData.year) completed++;
    if (formData.major) completed++;
    if (formData.academic_interests.length > 0) completed++;
    if (formData.skills.length > 0) completed++;
    if (formData.experience) completed++;
    if (formData.career_interests.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');

    try {
      if (existingProfile) {
        await api.updateMyProfile(formData);
      } else {
        const profile = await api.createMyProfile(formData);
        setExistingProfile(profile);
        // Update ProfileContext with the new profile ID
        setProfileId(profile.id);
      }
      await refreshUser();
      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => {
        router.push('/search');
      }, 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (field: 'academic_interests' | 'career_interests' | 'skills', item: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const addCustomItem = (field: 'academic_interests' | 'career_interests' | 'skills', item: string) => {
    if (item.trim() && !(formData[field] || []).includes(item.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), item.trim()]
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#011F5B]"></div>
      </div>
    );
  }

  const completion = calculateCompletion();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {existingProfile ? 'Edit Your Profile' : 'Create Your Profile'}
        </h1>
        <p className="text-gray-600 mt-2">
          Tell us about yourself so we can find research opportunities that match your interests.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm font-bold text-[#011F5B]">{completion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#011F5B] to-[#990000] h-2 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#011F5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#011F5B] focus:border-transparent transition"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#011F5B] focus:border-transparent transition"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#011F5B] focus:border-transparent transition"
              >
                <option value="">Select your year</option>
                {YEAR_OPTIONS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Major
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={e => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#011F5B] focus:border-transparent transition"
                placeholder="e.g., Computer Science, Biology"
              />
            </div>
          </div>
        </div>

        {/* Academic Interests Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#011F5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Academic Interests
          </h2>
          <p className="text-sm text-gray-500 mb-4">Select all that apply or add your own.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {INTEREST_OPTIONS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleArrayItem('academic_interests', interest)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  (formData.academic_interests || []).includes(interest)
                    ? 'bg-[#011F5B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Press Enter to add custom interest..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#011F5B] focus:border-transparent"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomItem('academic_interests', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          {(formData.academic_interests || []).filter(i => !INTEREST_OPTIONS.includes(i)).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(formData.academic_interests || []).filter(i => !INTEREST_OPTIONS.includes(i)).map(interest => (
                <span key={interest} className="px-3 py-1.5 rounded-full text-sm bg-[#990000] text-white flex items-center gap-1">
                  {interest}
                  <button type="button" onClick={() => toggleArrayItem('academic_interests', interest)} className="hover:text-gray-200 ml-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Skills Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#011F5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Skills
          </h2>
          <p className="text-sm text-gray-500 mb-4">Select skills you have or add your own.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {SKILL_OPTIONS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleArrayItem('skills', skill)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  (formData.skills || []).includes(skill)
                    ? 'bg-[#011F5B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Press Enter to add custom skill..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#011F5B] focus:border-transparent"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomItem('skills', (e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          {(formData.skills || []).filter(s => !SKILL_OPTIONS.includes(s)).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(formData.skills || []).filter(s => !SKILL_OPTIONS.includes(s)).map(skill => (
                <span key={skill} className="px-3 py-1.5 rounded-full text-sm bg-[#990000] text-white flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => toggleArrayItem('skills', skill)} className="hover:text-gray-200 ml-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Career Interests Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#011F5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Career Interests
          </h2>
          <p className="text-sm text-gray-500 mb-4">What career paths are you considering?</p>
          <textarea
            value={(formData.career_interests || []).join(', ')}
            onChange={e => setFormData({
              ...formData,
              career_interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#011F5B] focus:border-transparent transition"
            rows={2}
            placeholder="e.g., Research Scientist, Medical Doctor, Software Engineer (comma-separated)"
          />
        </div>

        {/* Experience Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#011F5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Experience & Background
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Briefly describe any relevant experience (research, coursework, projects, internships).
          </p>
          <textarea
            value={formData.experience}
            onChange={e => setFormData({ ...formData, experience: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#011F5B] focus:border-transparent transition"
            rows={4}
            placeholder="e.g., I worked in Dr. Smith's lab last summer doing PCR and gel electrophoresis. I've also taken CIS 120 and CIS 121..."
          />
        </div>

        {/* Resume Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#011F5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resume (Optional)
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Paste your resume text for better email personalization.
          </p>
          <textarea
            value={formData.resume_text}
            onChange={e => setFormData({ ...formData, resume_text: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#011F5B] focus:border-transparent transition font-mono text-sm"
            rows={6}
            placeholder="Paste your resume content here..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 pb-8">
          <button
            type="button"
            onClick={() => router.push('/search')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            {existingProfile ? 'Cancel' : 'Skip for now'}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#011F5B] text-white rounded-lg font-semibold hover:bg-[#012a7a] transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              existingProfile ? 'Update Profile' : 'Create Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
