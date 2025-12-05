'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, StudentProfile, StudentProfileCreate } from '@/lib/api';

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

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingProfile, setExistingProfile] = useState<StudentProfile | null>(null);

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

  useEffect(() => {
    // Load existing profile if available
    const profileId = localStorage.getItem('studentProfileId');
    if (profileId) {
      setLoading(true);
      api.getStudentProfile(profileId)
        .then(profile => {
          if (profile) {
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
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let profile: StudentProfile;
      if (existingProfile) {
        profile = await api.updateStudentProfile(existingProfile.id, formData);
      } else {
        profile = await api.createStudentProfile(formData);
      }
      localStorage.setItem('studentProfileId', profile.id);
      setExistingProfile(profile);
      alert('Profile saved successfully!');
      router.push('/search');
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {existingProfile ? 'Edit Your Profile' : 'Create Your Profile'}
      </h1>
      <p className="text-gray-600 mb-8">
        Tell us about yourself so we can find research opportunities that match your interests and qualifications.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#011F5B] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#011F5B] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#011F5B] focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#011F5B] focus:border-transparent"
                placeholder="e.g., Computer Science, Biology"
              />
            </div>
          </div>
        </section>

        {/* Academic Interests */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Academic Interests</h2>
          <p className="text-sm text-gray-600 mb-4">Select all that apply or add your own.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {INTEREST_OPTIONS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleArrayItem('academic_interests', interest)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  (formData.academic_interests || []).includes(interest)
                    ? 'bg-[#011F5B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom interest..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomItem('academic_interests', (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
          {(formData.academic_interests || []).filter(i => !INTEREST_OPTIONS.includes(i)).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(formData.academic_interests || []).filter(i => !INTEREST_OPTIONS.includes(i)).map(interest => (
                <span key={interest} className="px-3 py-1 rounded-full text-sm bg-[#990000] text-white flex items-center gap-1">
                  {interest}
                  <button
                    type="button"
                    onClick={() => toggleArrayItem('academic_interests', interest)}
                    className="hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Career Interests */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Career Interests</h2>
          <p className="text-sm text-gray-600 mb-4">What career paths are you considering?</p>
          <textarea
            value={(formData.career_interests || []).join(', ')}
            onChange={e => setFormData({
              ...formData,
              career_interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#011F5B] focus:border-transparent"
            rows={2}
            placeholder="e.g., Research Scientist, Medical Doctor, Software Engineer, Data Scientist"
          />
        </section>

        {/* Skills */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Skills</h2>
          <p className="text-sm text-gray-600 mb-4">Select skills you have or add your own.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {SKILL_OPTIONS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleArrayItem('skills', skill)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  (formData.skills || []).includes(skill)
                    ? 'bg-[#011F5B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom skill..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomItem('skills', (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
          {(formData.skills || []).filter(s => !SKILL_OPTIONS.includes(s)).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(formData.skills || []).filter(s => !SKILL_OPTIONS.includes(s)).map(skill => (
                <span key={skill} className="px-3 py-1 rounded-full text-sm bg-[#990000] text-white flex items-center gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleArrayItem('skills', skill)}
                    className="hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Experience */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Experience & Background</h2>
          <p className="text-sm text-gray-600 mb-4">
            Briefly describe any relevant experience (research, coursework, projects, internships).
          </p>
          <textarea
            value={formData.experience}
            onChange={e => setFormData({ ...formData, experience: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#011F5B] focus:border-transparent"
            rows={4}
            placeholder="e.g., I worked in Dr. Smith's lab last summer doing PCR and gel electrophoresis. I've also taken CIS 120 and CIS 121, and completed a data analysis project using Python..."
          />
        </section>

        {/* Resume (Optional) */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Resume (Optional)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Paste your resume text for better email personalization.
          </p>
          <textarea
            value={formData.resume_text}
            onChange={e => setFormData({ ...formData, resume_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#011F5B] focus:border-transparent font-mono text-sm"
            rows={6}
            placeholder="Paste your resume content here..."
          />
        </section>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/search')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-[#011F5B] text-white rounded-lg font-semibold hover:bg-[#012a7a] transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Create Profile')}
          </button>
        </div>
      </form>
    </div>
  );
}
