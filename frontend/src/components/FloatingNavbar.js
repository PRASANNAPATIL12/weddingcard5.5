import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Sparkles, Star, Zap, ChevronRight, Home, BookOpen, Calendar, Camera, Users, Gift, MessageCircle, HelpCircle } from 'lucide-react';
import { useAppTheme } from '../App';
import { useUserData } from '../contexts/UserDataContext';

const FloatingNavbar = ({ weddingData: propWeddingData, isPublicPage = false, activeSection, setActiveSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();
  const { currentTheme, setCurrentTheme, themes } = useAppTheme();
  const theme = themes[currentTheme];
  const { weddingData: contextWeddingData } = useUserData();
  const overlayRef = useRef(null);
  const menuRef = useRef(null);

  // Use prop wedding data if available (for public pages), otherwise use context data
  const weddingData = propWeddingData || contextWeddingData || {
    couple_name_1: 'Sarah',
    couple_name_2: 'Michael'
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (mobileMenuOpen && overlayRef.current && event.target === overlayRef.current) {
        closeMobileMenu();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [mobileMenuOpen]);

  const openMobileMenu = () => {
    setIsAnimating(true);
    setMobileMenuOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
    }, 300);
  };

  const handleMobileNavClick = (path) => {
    setTimeout(() => closeMobileMenu(), 100);
  };

  // Navigation items based on page type
  const navItems = isPublicPage ? [
    { path: '#home', label: 'Home', icon: Home },
    { path: '#story', label: 'Our Story', icon: BookOpen },
    { path: '#rsvp', label: 'RSVP', icon: Sparkles },
    { path: '#schedule', label: 'Schedule', icon: Calendar },
    { path: '#gallery', label: 'Gallery', icon: Camera },
    { path: '#party', label: 'Wedding Party', icon: Users },
    { path: '#registry', label: 'Registry', icon: Gift },
    { path: '#guestbook', label: 'Guestbook', icon: MessageCircle },
    { path: '#faq', label: 'FAQ', icon: HelpCircle }
  ] : [
    { path: '/', label: 'Home', icon: Heart },
    { path: '/story', label: 'Our Story', icon: Sparkles },
    { path: '/rsvp', label: 'RSVP', icon: Star },
    { path: '/schedule', label: 'Schedule', icon: Zap },
    { path: '/gallery', label: 'Gallery', icon: Heart },
    { path: '/party', label: 'Wedding Party', icon: Sparkles },
    { path: '/registry', label: 'Registry', icon: Star },
    { path: '/guestbook', label: 'Guestbook', icon: Zap },
    { path: '/faq', label: 'FAQ', icon: Heart }
  ];

  return (
    <>
      {/* Floating Navbar Container */}
      <nav 
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-700 ease-out ${
          scrolled 
            ? 'scale-95 shadow-2xl' 
            : 'scale-100 shadow-xl'
        }`}
        style={{
          width: 'min(90vw, 400px)',
          transformOrigin: 'center top'
        }}
      >
        {/* Main Floating Rectangle */}
        <div 
          className={`relative rounded-2xl px-6 py-4 transition-all duration-700 ease-out border ${
            scrolled 
              ? 'backdrop-blur-3xl bg-white/90' 
              : 'backdrop-blur-2xl bg-white/80'
          }`}
          style={{
            borderColor: `${theme.accent}30`,
            boxShadow: scrolled 
              ? `0 20px 40px ${theme.accent}20, 0 8px 16px ${theme.primary}10` 
              : `0 10px 30px ${theme.accent}15, 0 4px 12px ${theme.primary}08`,
          }}
        >
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}05 0%, ${theme.primary}03 100%)`
            }}
          />

          <div className="relative flex justify-between items-center">
            {/* Left Side: Couple Names with Heart */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative">
                <Heart 
                  className={`w-6 h-6 transition-all duration-500 ${
                    scrolled ? 'scale-90' : 'scale-100'
                  }`}
                  style={{ color: theme.accent }} 
                />
                <div 
                  className="absolute -inset-1 rounded-full opacity-0 animate-pulse"
                  style={{ 
                    background: `radial-gradient(circle, ${theme.accent}30 0%, transparent 70%)`
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 
                  className={`font-bold text-lg leading-tight transition-all duration-500 truncate ${
                    scrolled ? 'text-base' : 'text-lg'
                  }`}
                  style={{ 
                    fontFamily: theme.fontPrimary,
                    color: theme.primary,
                    textShadow: `0 2px 4px ${theme.primary}10`
                  }}
                >
                  {weddingData?.couple_name_1} & {weddingData?.couple_name_2}
                </h1>
              </div>
            </div>

            {/* Right Side: Hamburger Menu */}
            <button
              onClick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
              className="relative p-2 rounded-xl transition-all duration-500 hover:scale-110 focus:outline-none group ml-3"
              style={{ 
                backgroundColor: mobileMenuOpen ? `${theme.accent}20` : 'transparent'
              }}
              aria-label="Toggle mobile menu"
            >
              {/* Premium Hamburger Animation */}
              <div className="relative w-6 h-6">
                {/* Top bar */}
                <div 
                  className={`absolute top-1 left-0 w-6 h-0.5 rounded-full transition-all duration-500 ease-out ${
                    mobileMenuOpen ? 'rotate-45 translate-y-2' : 'rotate-0 translate-y-0'
                  }`}
                  style={{ 
                    backgroundColor: theme.primary,
                    transformOrigin: 'center'
                  }}
                />
                {/* Middle bar */}
                <div 
                  className={`absolute top-2.5 left-0 w-6 h-0.5 rounded-full transition-all duration-300 ease-out ${
                    mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                  style={{ backgroundColor: theme.primary }}
                />
                {/* Bottom bar */}
                <div 
                  className={`absolute top-4 left-0 w-6 h-0.5 rounded-full transition-all duration-500 ease-out ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-2' : 'rotate-0 translate-y-0'
                  }`}
                  style={{ 
                    backgroundColor: theme.primary,
                    transformOrigin: 'center'
                  }}
                />
              </div>

              {/* Hover effect */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `${theme.accent}15` }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Premium Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          ref={overlayRef}
          className={`fixed inset-0 z-[9999] transition-all duration-500 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            background: 'rgba(0, 0, 0, 0.20)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-10"
                style={{
                  background: `radial-gradient(circle, ${theme.accent}, ${theme.primary})`,
                  width: `${Math.random() * 80 + 40}px`,
                  height: `${Math.random() * 80 + 40}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>

          {/* Premium Dropdown Menu */}
          <div 
            ref={menuRef}
            className={`absolute top-20 left-1/2 transform -translate-x-1/2 w-80 max-w-[90vw] transition-all duration-700 ease-out ${
              mobileMenuOpen 
                ? 'translate-y-0 opacity-100 scale-100' 
                : '-translate-y-10 opacity-0 scale-95'
            }`}
            style={{
              transformOrigin: 'top center'
            }}
          >
            <div 
              className="rounded-3xl p-8 border"
              style={{
                background: `linear-gradient(135deg, ${theme.background}95, ${theme.secondary}85)`,
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderColor: `${theme.accent}20`,
                boxShadow: `0 30px 60px ${theme.primary}15, 0 12px 24px ${theme.accent}10`
              }}
            >
              {/* Menu Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-3 mb-3">
                  <Heart className="w-8 h-8" style={{ color: theme.accent }} />
                </div>
                <h2 
                  className="text-xl font-bold mb-1"
                  style={{ 
                    fontFamily: theme.fontPrimary,
                    color: theme.primary 
                  }}
                >
                  {weddingData?.couple_name_1} & {weddingData?.couple_name_2}
                </h2>
                <p className="text-sm opacity-70" style={{ color: theme.textLight }}>
                  Wedding Navigation
                </p>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || 
                                 (item.path.startsWith('#') && location.hash === item.path);
                  
                  const itemElement = isPublicPage ? (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={() => handleMobileNavClick(item.path)}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                        isActive ? 'scale-105' : 'hover:scale-102'
                      }`}
                      style={{ 
                        background: isActive 
                          ? `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}10)` 
                          : 'transparent',
                        animationDelay: `${index * 80}ms`,
                        color: isActive ? theme.accent : theme.text,
                        transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                        opacity: mobileMenuOpen ? 1 : 0,
                        animation: mobileMenuOpen ? `slideInUp 0.6s ease-out ${index * 80}ms forwards` : 'none'
                      }}
                    >
                      <AnimatedMenuItem 
                        Icon={Icon}
                        label={item.label}
                        isActive={isActive}
                        theme={theme}
                      />
                    </a>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => handleMobileNavClick(item.path)}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                        isActive ? 'scale-105' : 'hover:scale-102'
                      }`}
                      style={{ 
                        background: isActive 
                          ? `linear-gradient(135deg, ${theme.accent}20, ${theme.accent}10)` 
                          : 'transparent',
                        animationDelay: `${index * 80}ms`,
                        color: isActive ? theme.accent : theme.text,
                        transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                        opacity: mobileMenuOpen ? 1 : 0,
                        animation: mobileMenuOpen ? `slideInUp 0.6s ease-out ${index * 80}ms forwards` : 'none'
                      }}
                    >
                      <AnimatedMenuItem 
                        Icon={Icon}
                        label={item.label}
                        isActive={isActive}
                        theme={theme}
                      />
                    </Link>
                  );

                  return itemElement;
                })}
              </div>

              {/* Theme Selector */}
              {!isPublicPage && (
                <div className="mt-8 pt-6 border-t border-opacity-20" style={{ borderColor: theme.accent }}>
                  <label className="text-sm font-medium opacity-70 mb-3 block" style={{ color: theme.text }}>
                    Theme
                  </label>
                  <select
                    value={currentTheme}
                    onChange={(e) => setCurrentTheme(e.target.value)}
                    className="w-full bg-white/10 rounded-2xl px-4 py-3 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 backdrop-blur-sm"
                    style={{ 
                      color: theme.text,
                      border: `1px solid ${theme.accent}20`,
                      focusRing: `${theme.accent}40`
                    }}
                  >
                    <option value="classic">🎭 Classic Elegance</option>
                    <option value="modern">🚀 Modern Minimalist</option>
                    <option value="boho">🌸 Boho Chic</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add required CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

// Animated Menu Item Component
const AnimatedMenuItem = ({ Icon, label, isActive, theme }) => (
  <>
    {/* Premium hover background effect */}
    <div 
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
      style={{ background: `linear-gradient(135deg, ${theme.accent}08, ${theme.accent}03)` }}
    />
    
    {/* Icon with subtle animation */}
    <div className="relative z-10 flex-shrink-0">
      <Icon 
        className={`w-5 h-5 transition-all duration-500 ${
          isActive ? 'scale-110' : 'group-hover:scale-105'
        }`}
      />
    </div>
    
    {/* Label */}
    <span 
      className="relative z-10 font-medium text-base flex-1"
      style={{ fontFamily: theme.fontSecondary }}
    >
      {label}
    </span>
    
    {/* Premium arrow indicator */}
    <ChevronRight 
      className={`w-4 h-4 transition-all duration-500 ${
        isActive 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0'
      }`}
    />
    
    {/* Active indicator */}
    {isActive && (
      <div 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full"
        style={{ 
          background: `linear-gradient(to bottom, ${theme.accent}, ${theme.primary})`,
          animation: 'scaleIn 0.3s ease-out'
        }}
      />
    )}
  </>
);

export default FloatingNavbar;