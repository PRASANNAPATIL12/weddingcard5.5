import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppTheme } from '../App';
import { useUserData } from '../contexts/UserDataContext';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Users, 
  Image, 
  Settings, 
  LogOut, 
  Save,
  Plus,
  Trash2,
  User,
  Clock,
  Link as LinkIcon,
  Upload,
  Edit3,
  CheckCircle,
  Monitor,
  Smartphone,
  QrCode,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Camera,
  Star,
  Music,
  Utensils
} from 'lucide-react';

// Import homepage components for mini preview
import HomePage from './HomePage';
import StoryPage from './StoryPage';
import SchedulePage from './SchedulePage';
import GalleryPage from './GalleryPage';
import PartyPage from './PartyPage';
import RSVPPage from './RSVPPage';
import RegistryPage from './RegistryPage';
import FAQPage from './FAQPage';
import GuestbookPage from './GuestbookPage';

const DashboardPage = () => {
  const { themes } = useAppTheme();
  const navigate = useNavigate();
  
  // Use centralized user data context instead of local state
  const { 
    isAuthenticated, 
    weddingData, 
    saveWeddingData, 
    userInfo, 
    logout: contextLogout,
    isLoading: contextLoading 
  } = useUserData();
  
  // Get theme from themes object
  const theme = themes[currentTheme];
  
  // Dashboard-specific state
  const [activeSection, setActiveSection] = useState('edit');
  const [activeForm, setActiveForm] = useState(null);
  const [editDropdownOpen, setEditDropdownOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [currentPreviewPage, setCurrentPreviewPage] = useState('home');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [weddingUrl, setWeddingUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    // Check authentication using centralized context
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Generate wedding URL when wedding data is loaded
    if (weddingData && weddingData.shareable_id) {
      generateWeddingUrl(weddingData);
    }
  }, [isAuthenticated, weddingData, navigate]);

  const generateWeddingUrl = (weddingData) => {
    // Always prioritize shareable_id for the shareable URL
    const shareableId = weddingData?.shareable_id;
    if (shareableId) {
      // Generate shareable URL using /share/ route with shareable_id
      setWeddingUrl(`${window.location.origin}/share/${shareableId}`);
    } else if (weddingData?.id) {
      // Fallback to wedding_id if no shareable_id
      setWeddingUrl(`${window.location.origin}/wedding/${weddingData.id}`);
    }
  };

  const handleFormSubmit = (sectionId, formData) => {
    // Handle form submission and update wedding data
    let updatedData = { ...weddingData, ...formData };
    
    // Use centralized save function instead of duplicate autoSave
    saveWeddingData(updatedData);
    setActiveForm(null);
  };

  const handleDataChange = (field, value) => {
    const updatedData = {
      ...weddingData,
      [field]: value
    };
    
    // Use centralized save function - this will handle the MongoDB save
    saveWeddingData(updatedData);
  };

  const handleLogout = () => {
    contextLogout();
    navigate('/');
  };

  const copyToClipboard = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(weddingUrl);
      } else {
        // Fallback method: Create temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = weddingUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!result) {
          throw new Error('execCommand copy failed');
        }
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Show user a manual copy option
      const userPrompt = prompt('Copy this URL manually:', weddingUrl);
      if (userPrompt !== null) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const editSections = [
    { id: 'home', label: 'Home', icon: Heart, description: 'Edit couple names, date, venue' },
    { id: 'story', label: 'Our Story', icon: Heart, description: 'Timeline and love story' },
    { id: 'rsvp', label: 'RSVP', icon: Mail, description: 'RSVP form settings' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Wedding day timeline' },
    { id: 'gallery', label: 'Gallery', icon: Image, description: 'Photo gallery' },
    { id: 'party', label: 'Wedding Party', icon: Users, description: 'Bridal and groom party' },
    { id: 'registry', label: 'Registry', icon: LinkIcon, description: 'Gift registry links' },
    { id: 'guestbook', label: 'Guestbook', icon: MessageCircle, description: 'Guest messages' },
    { id: 'faq', label: 'FAQ', icon: Settings, description: 'Frequently asked questions' },
    { id: 'theme', label: 'Theme', icon: Settings, description: 'Classic, Modern, or Boho' }
  ];

  const sidebarSections = [
    { id: 'edit', label: 'Edit the Info', icon: Edit3 },
    { id: 'qr', label: 'Get QR Code', icon: QrCode },
    { id: 'url', label: 'Get Shareable Link', icon: LinkIcon },
    { id: 'email', label: 'Mail the Invitation', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp Invitation', icon: MessageCircle },
  ];

  // Mini Desktop Preview Component - Scaled down version of actual homepage
  const MiniDesktopPreview = () => {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });

    // Wedding date calculation
    const weddingDate = new Date(weddingData.wedding_date + 'T15:00:00');

    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate.getTime() - now;

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [weddingDate]);

    return (
      <div className="w-full h-full" style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '167%', height: '167%' }}>
        {/* Mini Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 transition-all duration-500 bg-white/80 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8" style={{ color: theme.accent }} />
              <span className="text-2xl font-light" style={{ fontFamily: theme.fontPrimary, color: theme.primary }}>
                {weddingData.couple_name_1} & {weddingData.couple_name_2}
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Home</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Our Story</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>RSVP</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Schedule</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Gallery</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Wedding Party</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Registry</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>Guestbook</a>
              <a href="#" className="text-lg font-medium hover:opacity-70 transition-opacity" style={{ color: theme.text }}>FAQ</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-sm"
                style={{ color: theme.text }}
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="boho">Boho</option>
              </select>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen text-center overflow-hidden pt-28 md:pt-0">
          {/* Background Image */}
          <div 
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1606490194859-07c18c9f0968?w=1920&h=1080&fit=crop)',
              zIndex: -2
            }}
          />
          
          {/* Gradient Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(248, 246, 240, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
              zIndex: -1
            }}
          />

          <div className="relative z-10 max-w-4xl px-8 mx-auto mt-8 md:mt-48">
            {/* Names */}
            <h1 
              className="text-6xl md:text-8xl font-light tracking-wider mb-8"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              {weddingData.couple_name_1} & {weddingData.couple_name_2}
            </h1>

            {/* Separator */}
            <div 
              className="w-24 h-0.5 mx-auto mb-8"
              style={{ background: theme.accent }}
            />

            {/* Wedding Date */}
            <h2 
              className="text-2xl md:text-3xl font-normal tracking-widest mb-4"
              style={{ 
                fontFamily: theme.fontSecondary,
                color: theme.text
              }}
            >
              {new Date(weddingData.wedding_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>

            {/* Venue */}
            <p 
              className="text-lg md:text-xl font-light tracking-wide mb-12"
              style={{ color: theme.textLight }}
            >
              {weddingData.venue_location}
            </p>

            {/* Countdown */}
            <div className="mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-lg mx-auto">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                  { value: timeLeft.seconds, label: 'Seconds' }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="text-center p-6 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30"
                  >
                    <span 
                      className="block text-3xl md:text-4xl font-semibold mb-2"
                      style={{ color: theme.accent }}
                    >
                      {item.value}
                    </span>
                    <span 
                      className="text-sm uppercase tracking-wider opacity-80"
                      style={{ color: theme.text }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-wider"
                style={{
                  background: theme.gradientAccent,
                  color: theme.primary,
                  boxShadow: `0 10px 30px ${theme.accent}30`
                }}
              >
                <Heart className="w-5 h-5" />
                RSVP Now
              </button>
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold tracking-wider border-2"
                style={{
                  borderColor: theme.accent,
                  color: theme.text,
                  background: 'transparent'
                }}
              >
                <Calendar className="w-5 h-5" />
                Event Details
              </button>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section 
          className="py-24 px-8"
          style={{ background: theme.gradientPrimary }}
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 
              className="text-5xl font-light mb-8"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Join Us for Our Special Day
            </h2>

            <p 
              className="text-xl leading-relaxed max-w-3xl mx-auto mb-16"
              style={{ color: theme.textLight }}
            >
              {weddingData.their_story}
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: 'Save the Date',
                  text: `Mark your calendars for ${new Date(weddingData.wedding_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}. Ceremony begins at 3:00 PM, followed by cocktails and dinner reception.`
                },
                {
                  icon: MapPin,
                  title: 'Beautiful Venue',
                  text: `${weddingData.venue_name} provides the perfect romantic backdrop for our celebration.`
                },
                {
                  icon: Heart,
                  title: 'Love & Joy',
                  text: 'Come celebrate love, laughter, and the beginning of our forever. Your presence will make our day complete.'
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
                  >
                    <div 
                      className="text-5xl mb-6"
                      style={{ color: theme.accent }}
                    >
                      <Icon className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 
                      className="text-2xl font-semibold mb-4"
                      style={{ 
                        fontFamily: theme.fontPrimary,
                        color: theme.primary 
                      }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      className="text-lg leading-relaxed"
                      style={{ color: theme.textLight }}
                    >
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex"
      style={{
        background: theme.background,
        fontFamily: theme.fontSecondary
      }}
    >
      {/* Left Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-xl border-r border-white/30 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/30">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8" style={{ color: theme.accent }} />
            <h1 
              className="text-2xl font-light"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Wedding Editor
            </h1>
          </div>
          
          {/* Auto-save indicator */}
          {autoSaving && (
            <div className="flex items-center space-x-2 text-sm" style={{ color: theme.accent }}>
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              <span>Auto-saving...</span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {sidebarSections.map((section) => {
              const Icon = section.icon;
              const isEditSection = section.id === 'edit';
              
              return (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      if (isEditSection) {
                        setEditDropdownOpen(!editDropdownOpen);
                      }
                      setActiveSection(section.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                      activeSection === section.id 
                        ? 'shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    style={{
                      background: activeSection === section.id 
                        ? theme.gradientAccent 
                        : 'rgba(255,255,255,0.1)',
                      color: activeSection === section.id 
                        ? theme.primary 
                        : theme.text
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </div>
                    {isEditSection && (
                      editDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  {/* Edit Dropdown */}
                  {isEditSection && editDropdownOpen && (
                    <div className="mt-2 ml-4 space-y-1">
                      {editSections.map((editSection) => {
                        const EditIcon = editSection.icon;
                        return (
                          <button
                            key={editSection.id}
                            onClick={() => setActiveForm(editSection.id)}
                            className="w-full flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-white/10"
                            style={{ color: theme.textLight }}
                          >
                            <EditIcon className="w-4 h-4" />
                            <div className="text-left">
                              <div className="text-sm font-medium">{editSection.label}</div>
                              <div className="text-xs opacity-70">{editSection.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:bg-red-500/10 hover:scale-105"
            style={{ color: theme.textLight }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        <div className="p-6 border-b border-white/30 bg-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Desktop/Mobile Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium" style={{ color: theme.text }}>Preview:</span>
              <div className="flex bg-white/20 rounded-2xl p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    previewMode === 'desktop' ? 'shadow-md' : ''
                  }`}
                  style={{
                    background: previewMode === 'desktop' ? theme.accent : 'transparent',
                    color: previewMode === 'desktop' ? 'white' : theme.text
                  }}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    previewMode === 'mobile' ? 'shadow-md' : ''
                  }`}
                  style={{
                    background: previewMode === 'mobile' ? theme.accent : 'transparent',
                    color: previewMode === 'mobile' ? 'white' : theme.text
                  }}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">Mobile</span>
                </button>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium" style={{ color: theme.text }}>Page:</span>
              <select
                value={currentPreviewPage}
                onChange={(e) => setCurrentPreviewPage(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/20 border border-white/30"
                style={{ color: theme.text }}
              >
                <option value="home">Home</option>
                <option value="story">Our Story</option>
                <option value="schedule">Schedule</option>
                <option value="gallery">Gallery</option>
                <option value="party">Wedding Party</option>
                <option value="rsvp">RSVP</option>
                <option value="registry">Registry</option>
                <option value="faq">FAQ</option>
                <option value="guestbook">Guestbook</option>
              </select>
            </div>

            {/* Wedding URL */}
            {weddingUrl && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300"
                  style={{ color: theme.text }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy Shareable Link'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mini Desktop Preview */}
        <div className="flex-1 p-6">
          <div className="w-full h-full flex items-center justify-center">
            <div 
              className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${
                previewMode === 'desktop' 
                  ? 'w-full max-w-5xl h-96' 
                  : 'w-80 h-96'
              }`}
              style={{ 
                border: `3px solid ${theme.accent}30`,
                background: 'white'
              }}
            >
              {/* Mini Desktop Frame */}
              <div className="w-full h-full relative">
                {/* Browser-like header */}
                <div 
                  className="h-8 flex items-center px-4 border-b"
                  style={{ background: theme.primary + '10' }}
                >
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs" style={{ color: theme.textLight }}>
                      Wedding Preview - {previewMode === 'desktop' ? 'Desktop' : 'Mobile'} View
                    </span>
                  </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="h-[calc(100%-2rem)] overflow-y-auto overflow-x-hidden">
                  <MiniDesktopPreview />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Popups */}
      {activeForm && (
        <FormPopup
          sectionId={activeForm}
          onClose={() => setActiveForm(null)}
          onSubmit={handleFormSubmit}
          initialData={weddingData}
          theme={theme}
        />
      )}
    </div>
  );
};

// Form Popup Component
const FormPopup = ({ sectionId, onClose, onSubmit, initialData, theme }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(sectionId, formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderForm = () => {
    switch (sectionId) {
      case 'home':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              Edit Home Section
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Bride's Name
                </label>
                <input
                  type="text"
                  defaultValue={initialData.couple_name_1}
                  onChange={(e) => handleChange('couple_name_1', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                  style={{ color: theme.text }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Groom's Name
                </label>
                <input
                  type="text"
                  defaultValue={initialData.couple_name_2}
                  onChange={(e) => handleChange('couple_name_2', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                  style={{ color: theme.text }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Wedding Date
                </label>
                <input
                  type="date"
                  defaultValue={initialData.wedding_date}
                  onChange={(e) => handleChange('wedding_date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                  style={{ color: theme.text }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  Venue Name
                </label>
                <input
                  type="text"
                  defaultValue={initialData.venue_name}
                  onChange={(e) => handleChange('venue_name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                  style={{ color: theme.text }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Venue Location
              </label>
              <input
                type="text"
                defaultValue={initialData.venue_location}
                onChange={(e) => handleChange('venue_location', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30"
                style={{ color: theme.text }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                Love Story Description
              </label>
              <textarea
                rows={4}
                defaultValue={initialData.their_story}
                onChange={(e) => handleChange('their_story', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 resize-none"
                style={{ color: theme.text }}
              />
            </div>
          </div>
        );
      
      case 'story':
        return (
          <OurStoryForm 
            initialData={initialData} 
            theme={theme} 
            onSave={handleChange} 
          />
        );

      case 'theme':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              Choose Your Theme
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {['classic', 'modern', 'boho'].map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => handleChange('theme', themeName)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    initialData.theme === themeName ? 'border-current' : 'border-transparent'
                  }`}
                  style={{ 
                    background: 'rgba(255,255,255,0.1)',
                    borderColor: initialData.theme === themeName ? theme.accent : 'transparent'
                  }}
                >
                  <div className="text-lg font-semibold capitalize mb-2" style={{ color: theme.primary }}>
                    {themeName}
                  </div>
                  <div className="text-sm" style={{ color: theme.textLight }}>
                    {themeName === 'classic' && 'Elegant and timeless'}
                    {themeName === 'modern' && 'Clean and contemporary'}
                    {themeName === 'boho' && 'Bohemian and romantic'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
              Edit {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Section
            </h3>
            <p style={{ color: theme.textLight }}>
              Form for {sectionId} section coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ border: `1px solid ${theme.accent}30` }}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div></div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/10 transition-colors duration-200"
              style={{ color: theme.textLight }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {renderForm()}
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                style={{ color: theme.text }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: theme.gradientAccent,
                  color: theme.primary
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;