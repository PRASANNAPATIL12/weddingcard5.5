import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppTheme } from '../App';
import { Calendar, MapPin, Heart, Clock, User, MessageCircle, Camera, ArrowLeft, Home, BookOpen, Mail, Users, Gift, HelpCircle, Star, Menu, X, ChevronRight, Sparkles } from 'lucide-react';

// Default wedding data for fallback
const defaultWeddingData = {
  couple_name_1: 'Sarah',
  couple_name_2: 'Michael',
  wedding_date: '2025-06-15',
  venue_name: 'Sunset Garden Estate',
  venue_location: 'Sunset Garden Estate • Napa Valley, California',
  their_story: 'We can\'t wait to celebrate our love story with the people who matter most to us. Join us for an unforgettable evening of joy, laughter, and new beginnings.',
  theme: 'classic'
};

const PublicWeddingPage = () => {
  const { weddingId, shareableId } = useParams();
  const { themes } = useAppTheme();
  const [currentTheme, setTheme] = useState('classic');
  const theme = themes[currentTheme];
  const navigate = useNavigate();
  
  const [weddingData, setWeddingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Navigation items for public view
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'story', label: 'Our Story', icon: BookOpen },
    { id: 'rsvp', label: 'RSVP', icon: Mail },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: Camera },
    { id: 'party', label: 'Wedding Party', icon: Users },
    { id: 'registry', label: 'Registry', icon: Gift },
    { id: 'guestbook', label: 'Guestbook', icon: MessageCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle }
  ];

  useEffect(() => {
    loadWeddingData();
  }, [weddingId, shareableId]);

  useEffect(() => {
    if (weddingData && weddingData.wedding_date) {
      const timer = setInterval(() => {
        const weddingDate = new Date(weddingData.wedding_date + 'T15:00:00');
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
    }
  }, [weddingData]);

  useEffect(() => {
    if (weddingData && weddingData.theme) {
      setTheme(weddingData.theme);
    }
  }, [weddingData]);

  const loadWeddingData = async () => {
    try {
      setLoading(true);
      console.log('PublicWeddingPage - Parameters:', { weddingId, shareableId });
      
      // Determine which identifier to use (prioritize shareableId)
      const identifier = shareableId || weddingId;
      
      if (identifier) {
        try {
          // Use REACT_APP_BACKEND_URL environment variable or fallback to localhost:8001
          let backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
          console.log('PublicWeddingPage - Using backend URL:', backendUrl);
          
          // Use different endpoints based on identifier type
          let apiUrl;
          if (shareableId) {
            // For shareable links: /api/wedding/share/{shareableId}
            apiUrl = `${backendUrl}/api/wedding/share/${shareableId}`;
            console.log('PublicWeddingPage - Using shareable ID:', shareableId);
          } else {
            // For legacy wedding IDs: /api/wedding/public/{weddingId}
            apiUrl = `${backendUrl}/api/wedding/public/${weddingId}`;
            console.log('PublicWeddingPage - Using wedding ID:', weddingId);
          }
          
          console.log('PublicWeddingPage - Fetching from:', apiUrl);
          
          const response = await fetch(apiUrl);
          console.log('PublicWeddingPage - Response status:', response.status);
          
          if (response.ok) {
            const foundWeddingData = await response.json();
            console.log('Found wedding data from backend:', foundWeddingData);
            setWeddingData(foundWeddingData);
          } else if (response.status === 404) {
            // Wedding not found - set error state
            const errorData = await response.json();
            console.log('Wedding not found:', errorData.detail);
            setError(`Wedding not found. The URL "${weddingId}" doesn't exist. Please check the URL or create your wedding first.`);
            setLoading(false);
            return;
          } else {
            const errorText = await response.text();
            console.log('Backend response error:', response.status, errorText);
            setError(`Unable to load wedding data. Please check your internet connection and try again.`);
            setLoading(false);
            return;
          }
        } catch (backendError) {
          console.error('❌ Backend API error:', backendError);
          setError(`Unable to load wedding data. Please check your internet connection and try again.`);
          setLoading(false);
          return;
        }
      } else {
        setError(`No wedding ID provided in the URL.`);
        setLoading(false);
        return;
      }
      
    } catch (error) {
      console.error('❌ Error loading wedding data:', error);
      console.error('❌ Error details:', error.message);
      
      // Only use default data for network/connection errors, not API errors
      if (error.message && error.message.includes('fetch')) {
        console.log('Network error - using default data as fallback');
        setWeddingData(defaultWeddingData);
      } else {
        setError(`Failed to load wedding data: ${error.message || 'Unknown error'}`);
      }
    } finally {
      console.log('PublicWeddingPage - Setting loading to false');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: theme.gradientPrimary,
          fontFamily: theme.fontSecondary 
        }}
      >
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 animate-pulse" style={{ color: theme.accent }} />
          <p className="text-xl" style={{ color: theme.text }}>Loading your wedding card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: theme.gradientPrimary,
          fontFamily: theme.fontSecondary 
        }}
      >
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textLight }} />
          <h1 className="text-2xl font-semibold mb-2" style={{ color: theme.primary }}>
            Oops! Wedding Card Not Found
          </h1>
          <p className="text-lg" style={{ color: theme.textLight }}>{error}</p>
        </div>
      </div>
    );
  }

  // Navigation component
  const Navigation = () => (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
      style={{ 
        backgroundColor: `${theme.background}95`,
        borderColor: `${theme.accent}20`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8" style={{ color: theme.accent }} />
            <span 
              className="text-xl font-semibold"
              style={{ 
                color: theme.primary,
                fontFamily: theme.fontPrimary 
              }}
            >
              {weddingData?.couple_name_1} & {weddingData?.couple_name_2}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeSection === item.id 
                    ? 'bg-opacity-20' 
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor: activeSection === item.id ? theme.accent : 'transparent',
                  color: activeSection === item.id ? theme.primary : theme.textLight
                }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Premium Floating Mobile Menu Button - Top Center */}
          <div className="lg:hidden">
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60]">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-nav-toggle"
                className="relative px-4 py-3 rounded-2xl transition-all duration-500 hover:scale-105 focus:outline-none group shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.background}85, ${theme.secondary}70)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.accent}25`,
                  boxShadow: `0 8px 32px ${theme.accent}15`
                }}
                aria-label="Toggle mobile menu"
              >
                {/* Premium 3-Bar Hamburger Animation */}
                <div className="relative w-6 h-5 flex flex-col justify-between">
                  <span 
                    className={`block h-0.5 w-6 rounded-full transition-all duration-500 ease-out transform origin-center ${
                      mobileMenuOpen 
                        ? 'rotate-45 translate-y-2' 
                        : 'rotate-0 translate-y-0'
                    }`}
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span 
                    className={`block h-0.5 w-6 rounded-full transition-all duration-300 ease-out ${
                      mobileMenuOpen 
                        ? 'opacity-0 scale-0' 
                        : 'opacity-100 scale-100'
                    }`}
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span 
                    className={`block h-0.5 w-6 rounded-full transition-all duration-500 ease-out transform origin-center ${
                      mobileMenuOpen 
                        ? '-rotate-45 -translate-y-2' 
                        : 'rotate-0 translate-y-0'
                    }`}
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                
                {/* Premium hover effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.accent}08, ${theme.accent}15)`,
                    boxShadow: `0 4px 16px ${theme.accent}20`
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Translucent Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className={`fixed inset-0 z-[55] lg:hidden transition-all duration-500 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            background: 'rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Subtle Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-5 animate-float"
                style={{
                  background: `linear-gradient(45deg, ${theme.accent}, ${theme.primary})`,
                  width: `${Math.random() * 60 + 30}px`,
                  height: `${Math.random() * 60 + 30}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${4 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Premium Drop-down Translucent Mobile Menu Panel */}
          <div 
            className={`absolute left-1/2 transform -translate-x-1/2 w-80 max-w-[90vw] transition-all duration-700 ease-out ${
              mobileMenuOpen 
                ? 'top-20 opacity-100 scale-100 translate-y-0' 
                : 'top-10 opacity-0 scale-95 -translate-y-4'
            }`}
            style={{
              background: `linear-gradient(135deg, ${theme.background}75, ${theme.secondary}65)`,
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              border: `1px solid ${theme.accent}20`,
              borderRadius: '24px',
              boxShadow: `0 20px 60px ${theme.accent}10, 0 8px 24px rgba(0, 0, 0, 0.1)`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Premium Menu Header */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="relative">
                    <Heart className="w-6 h-6" style={{ color: theme.accent }} />
                  </div>
                  <h2 
                    className="text-lg font-bold"
                    style={{ 
                      fontFamily: theme.fontPrimary,
                      color: theme.primary 
                    }}
                  >
                    {weddingData?.couple_name_1} & {weddingData?.couple_name_2}
                  </h2>
                </div>
                <p className="text-xs opacity-60" style={{ color: theme.textLight }}>
                  Wedding Website
                </p>
              </div>
            </div>

            {/* Premium Navigation Items with Staggered Animation */}
            <div className="flex-1 px-6 py-2 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const shouldAnimate = mobileMenuOpen;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    data-testid={`nav-${item.id}`}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-500 group relative overflow-hidden ${
                      isActive ? 'scale-105' : 'hover:scale-102'
                    } ${shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ 
                      background: isActive 
                        ? `linear-gradient(135deg, ${theme.accent}15, ${theme.accent}08)` 
                        : 'transparent',
                      transitionDelay: shouldAnimate ? `${index * 80 + 200}ms` : '0ms',
                      color: isActive ? theme.accent : theme.text
                    }}
                  >
                    {/* Premium background hover effect */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-400"
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.accent}08, ${theme.accent}03)`,
                      }}
                    />
                    
                    {/* Icon with micro-animation */}
                    <div className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Label */}
                    <span 
                      className="relative z-10 font-medium text-sm flex-1 transition-all duration-300 group-hover:tracking-wide"
                      style={{ fontFamily: theme.fontSecondary }}
                    >
                      {item.label}
                    </span>
                    
                    {/* Premium arrow indicator */}
                    <ChevronRight 
                      className={`w-3 h-3 transition-all duration-400 ${
                        isActive 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 -translate-x-2 group-hover:opacity-70 group-hover:translate-x-1'
                      }`}
                    />
                    
                    {/* Active indicator with pulse */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full animate-pulse"
                        style={{ 
                          background: `linear-gradient(to bottom, ${theme.accent}, ${theme.accent}60)`,
                          boxShadow: `0 0 8px ${theme.accent}40`
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Premium Menu Footer */}
            <div className="p-6">
              <div className="text-center space-y-3">
                <p className="text-xs opacity-50" style={{ color: theme.textLight }}>
                  Join us in celebrating our special day
                </p>
                <div className="flex justify-center gap-2">
                  {[Heart, Sparkles, Star].map((Icon, i) => (
                    <Icon 
                      key={i}
                      className="w-3 h-3 opacity-40 animate-pulse transition-all duration-300 hover:opacity-80 hover:scale-125" 
                      style={{ 
                        color: theme.accent,
                        animationDelay: `${i * 0.2}s`
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );

  // Home Section Component
  const HomeSection = () => (
    <div className="pt-24 pb-16">
      <div className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Heart className="w-20 h-20 mx-auto mb-6 animate-pulse" style={{ color: theme.accent }} />
            <h1 
              className="text-6xl md:text-8xl font-light mb-4"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary,
                background: theme.gradientAccent,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {weddingData?.couple_name_1} & {weddingData?.couple_name_2}
            </h1>
            
            {weddingData?.wedding_date && (
              <p className="text-2xl md:text-3xl mb-4" style={{ color: theme.textLight }}>
                {formatDate(weddingData.wedding_date)}
              </p>
            )}
            
            {weddingData?.venue_location && (
              <p className="text-lg flex items-center justify-center space-x-2" style={{ color: theme.text }}>
                <MapPin className="w-5 h-5" />
                <span>{weddingData.venue_location}</span>
              </p>
            )}
          </div>

          {/* Countdown */}
          {timeLeft.days > 0 && (
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30 mb-12">
              <h2 className="text-2xl font-semibold mb-6" style={{ color: theme.primary }}>
                Counting Down to Our Special Day
              </h2>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit} className="text-center">
                    <div 
                      className="text-4xl md:text-5xl font-bold"
                      style={{ color: theme.accent }}
                    >
                      {value}
                    </div>
                    <div 
                      className="text-sm uppercase tracking-wide font-medium"
                      style={{ color: theme.textLight }}
                    >
                      {unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RSVP and Event Details Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              className="px-8 py-4 rounded-full text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ background: theme.gradientAccent }}
            >
              <Heart className="w-5 h-5 inline-block mr-2" />
              RSVP Now
            </button>
            <button
              className="px-8 py-4 rounded-full border-2 font-semibold transition-all duration-300 hover:scale-105"
              style={{ 
                borderColor: theme.accent,
                color: theme.accent,
                backgroundColor: 'transparent'
              }}
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              Event Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Our Story Section Component
  const StorySection = () => (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30">
        <h2 
          className="text-3xl font-light mb-6 text-center"
          style={{ 
            fontFamily: theme.fontPrimary,
            color: theme.primary 
          }}
        >
          Our Love Story
        </h2>
        {weddingData?.their_story && (
          <p 
            className="text-lg leading-relaxed text-center max-w-3xl mx-auto"
            style={{ color: theme.text }}
          >
            {weddingData.their_story}
          </p>
        )}
        
        {/* Timeline */}
        {weddingData?.story_timeline && weddingData.story_timeline.length > 0 && (
          <div className="mt-12 space-y-8">
            {weddingData.story_timeline.map((stage, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div 
                  className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ background: theme.gradientAccent }}
                >
                  {stage.year}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: theme.primary }}>
                    {stage.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ color: theme.text }}>
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

      {/* Schedule */}
      {weddingData?.schedule_events && weddingData.schedule_events.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30">
            <h2 
              className="text-3xl font-light mb-8 text-center"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Wedding Day Schedule
            </h2>
            <div className="space-y-6">
              {weddingData.schedule_events.map((event, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white/30 backdrop-blur-lg rounded-2xl">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: theme.gradientAccent }}
                    >
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
                        {event.title}
                      </h3>
                      <span className="text-sm font-medium" style={{ color: theme.accent }}>
                        {event.time}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm mb-2" style={{ color: theme.text }}>
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-sm flex items-center space-x-1" style={{ color: theme.textLight }}>
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      {weddingData?.gallery_photos && weddingData.gallery_photos.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30">
            <h2 
              className="text-3xl font-light mb-8 text-center"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Our Memories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {weddingData.gallery_photos.map((photo, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-lg rounded-2xl p-2 border border-white/40">
                  <img
                    src={photo.url}
                    alt={`Memory ${index + 1}`}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wedding Party */}
      {((weddingData?.bridal_party && weddingData.bridal_party.length > 0) || 
        (weddingData?.groom_party && weddingData.groom_party.length > 0)) && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30">
            <h2 
              className="text-3xl font-light mb-8 text-center"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Our Wedding Party
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bridal Party */}
              {weddingData.bridal_party && weddingData.bridal_party.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: theme.accent }}>
                    Bridal Party
                  </h3>
                  <div className="space-y-4">
                    {weddingData.bridal_party.map((member, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white/30 backdrop-blur-lg rounded-2xl">
                        {member.photo && (
                          <img
                            src={member.photo.url}
                            alt={member.name}
                            className="w-16 h-16 object-cover rounded-full flex-shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold" style={{ color: theme.primary }}>
                            {member.name}
                          </h4>
                          <p className="text-sm" style={{ color: theme.accent }}>
                            {member.role}
                          </p>
                          {member.description && (
                            <p className="text-sm mt-1" style={{ color: theme.text }}>
                              {member.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groom Party */}
              {weddingData.groom_party && weddingData.groom_party.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: theme.accent }}>
                    Groom's Party
                  </h3>
                  <div className="space-y-4">
                    {weddingData.groom_party.map((member, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white/30 backdrop-blur-lg rounded-2xl">
                        {member.photo && (
                          <img
                            src={member.photo.url}
                            alt={member.name}
                            className="w-16 h-16 object-cover rounded-full flex-shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold" style={{ color: theme.primary }}>
                            {member.name}
                          </h4>
                          <p className="text-sm" style={{ color: theme.accent }}>
                            {member.role}
                          </p>
                          {member.description && (
                            <p className="text-sm mt-1" style={{ color: theme.text }}>
                              {member.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

  // Render content based on active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'story':
        return <StorySection />;
      case 'schedule':
        return <ScheduleSection />;
      case 'gallery':
        return <GallerySection />;
      case 'party':
        return <PartySection />;
      case 'faq':
        return <FAQSection />;
      default:
        return <HomeSection />;
    }
  };

  // Schedule Section Component  
  const ScheduleSection = () => (
    <div className="pt-24 pb-16">
      {weddingData?.schedule_events && weddingData.schedule_events.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30">
            <h2 
              className="text-3xl font-light mb-8 text-center"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Wedding Day Schedule
            </h2>
            <div className="space-y-6">
              {weddingData.schedule_events.map((event, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white/30 backdrop-blur-lg rounded-2xl">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: theme.gradientAccent }}
                    >
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
                        {event.title}
                      </h3>
                      <span className="text-sm font-medium" style={{ color: theme.accent }}>
                        {event.time}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm mb-2" style={{ color: theme.text }}>
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-sm flex items-center space-x-1" style={{ color: theme.textLight }}>
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Gallery Section Component
  const GallerySection = () => (
    <div className="pt-24 pb-16">
      {weddingData?.gallery_photos && weddingData.gallery_photos.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30">
            <h2 
              className="text-3xl font-light mb-8 text-center"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Our Memories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {weddingData.gallery_photos.map((photo, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-lg rounded-2xl p-2 border border-white/40">
                  <img
                    src={photo.url}
                    alt={`Memory ${index + 1}`}
                    className="w-full h-40 object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Wedding Party Section Component
  const PartySection = () => (
    <div className="pt-24 pb-16">
      {((weddingData?.bridal_party && weddingData.bridal_party.length > 0) || 
        (weddingData?.groom_party && weddingData.groom_party.length > 0)) && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30">
            <h2 
              className="text-3xl font-light mb-8 text-center"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Our Wedding Party
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bridal Party */}
              {weddingData.bridal_party && weddingData.bridal_party.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: theme.accent }}>
                    Bridal Party
                  </h3>
                  <div className="space-y-4">
                    {weddingData.bridal_party.map((member, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white/30 backdrop-blur-lg rounded-2xl">
                        {member.photo && (
                          <img
                            src={member.photo.url}
                            alt={member.name}
                            className="w-16 h-16 object-cover rounded-full flex-shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold" style={{ color: theme.primary }}>
                            {member.name}
                          </h4>
                          <p className="text-sm" style={{ color: theme.accent }}>
                            {member.role}
                          </p>
                          {member.description && (
                            <p className="text-sm mt-1" style={{ color: theme.text }}>
                              {member.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groom Party */}
              {weddingData.groom_party && weddingData.groom_party.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-center" style={{ color: theme.accent }}>
                    Groom's Party
                  </h3>
                  <div className="space-y-4">
                    {weddingData.groom_party.map((member, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-white/30 backdrop-blur-lg rounded-2xl">
                        {member.photo && (
                          <img
                            src={member.photo.url}
                            alt={member.name}
                            className="w-16 h-16 object-cover rounded-full flex-shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold" style={{ color: theme.primary }}>
                            {member.name}
                          </h4>
                          <p className="text-sm" style={{ color: theme.accent }}>
                            {member.role}
                          </p>
                          {member.description && (
                            <p className="text-sm mt-1" style={{ color: theme.text }}>
                              {member.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // FAQ Section Component
  const FAQSection = () => (
    <div className="pt-24 pb-16">
      {weddingData?.faqs && weddingData.faqs.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30">
            <h2 
              className="text-3xl font-light mb-8 text-center"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {weddingData.faqs.map((faq, index) => (
                <div key={index} className="p-6 bg-white/30 backdrop-blur-lg rounded-2xl">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: theme.primary }}>
                    {faq.question}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Floating Template Button Component
  const FloatingTemplateButton = () => (
    <button
      onClick={() => navigate('/login')}
      className="fixed bottom-6 right-6 z-40 flex items-center space-x-3 px-6 py-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
      style={{
        background: theme.gradientAccent,
        color: 'white'
      }}
    >
      <Star className="w-6 h-6" />
      <span className="font-semibold hidden sm:inline">Use This Template</span>
      <span className="font-semibold sm:hidden">Get Template</span>
    </button>
  );

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${theme.secondary}80 0%, ${theme.background}90 50%, ${theme.accent}10 100%)`,
        fontFamily: theme.fontSecondary
      }}
    >
      <Navigation />
      
      {/* Main Content */}
      <div className="relative">
        {renderActiveSection()}
      </div>

      {/* Footer */}
      <div className="text-center py-16">
        <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: theme.accent }} />
        <p className="text-lg" style={{ color: theme.textLight }}>
          Thank you for celebrating with us!
        </p>
        <p className="text-sm mt-2" style={{ color: theme.textLight }}>
          {weddingData?.couple_name_1} & {weddingData?.couple_name_2}
        </p>
      </div>

      {/* Floating Template Button */}
      <FloatingTemplateButton />
    </div>
  );
};

export default PublicWeddingPage;