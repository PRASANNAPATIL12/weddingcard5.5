import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Sparkles, Star, Zap, ChevronRight } from 'lucide-react';
import { useAppTheme } from '../App';
import { useUserData } from '../contexts/UserDataContext';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const location = useLocation();
  const { currentTheme, setCurrentTheme, themes } = useAppTheme();
  const theme = themes[currentTheme];
  const { weddingData } = useUserData();
  const overlayRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
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
    // Show all menu items immediately, then animate them in
    setActiveIndex(navItems.length);
  };

  const closeMobileMenu = () => {
    setIsAnimating(true);
    setActiveIndex(-1);
    setTimeout(() => {
      setMobileMenuOpen(false);
      document.body.style.overflow = 'unset';
      setIsAnimating(false);
    }, 300);
  };

  const handleMobileNavClick = (path, index) => {
    setActiveIndex(index);
    setTimeout(() => closeMobileMenu(), 100);
  };

  const navItems = [
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
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white/10 backdrop-blur-md'
        }`}
        style={{
          borderBottom: scrolled 
            ? `1px solid ${theme.accent}20` 
            : `1px solid ${theme.accent}10`
        }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center gap-3 text-2xl font-semibold text-decoration-none group transition-all duration-300 hover:scale-105"
            style={{ 
              fontFamily: theme.fontPrimary,
              color: theme.primary 
            }}
          >
            <div className="relative">
              <Heart className="w-7 h-7" />
            </div>
            {weddingData.couple_name_1} & {weddingData.couple_name_2}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium text-sm tracking-wider transition-all duration-300 hover:scale-105 relative group px-2 py-1 rounded-lg ${
                  location.pathname === item.path 
                    ? 'scale-105' 
                    : 'hover:bg-white/10'
                }`}
                style={{ 
                  color: location.pathname === item.path ? theme.accent : theme.text 
                }}
              >
                {item.label}
                {location.pathname === item.path && (
                  <div 
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full animate-scale-in"
                    style={{ background: theme.accent }}
                  />
                )}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ background: `${theme.accent}15` }}></div>
              </Link>
            ))}

            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value)}
              className="bg-white/20 rounded-xl px-4 py-2 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 hover:bg-white/30 backdrop-blur-sm"
              style={{ 
                color: theme.text,
                border: `1px solid ${theme.accent}20`,
                focusRing: `${theme.accent}40`
              }}
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="boho">Boho</option>
            </select>
          </div>

          {/* Premium Floating Mobile Menu Button - Top Center */}
          <div className="lg:hidden">
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60]">
              <button
                onClick={() => mobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
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
      </nav>

      {/* Premium Translucent Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          ref={overlayRef}
          className={`fixed inset-0 z-[55] lg:hidden transition-all duration-500 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            background: 'rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
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
            ref={menuRef}
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
          >
            {/* Menu Header - Light and Minimal */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Heart className="w-6 h-6" style={{ color: theme.accent }} />
                  </div>
                  <div>
                    <h2 
                      className="text-lg font-bold"
                      style={{ 
                        fontFamily: theme.fontPrimary,
                        color: theme.primary 
                      }}
                    >
                      {weddingData.couple_name_1} & {weddingData.couple_name_2}
                    </h2>
                    <p className="text-xs opacity-60" style={{ color: theme.textLight }}>
                      Wedding Website
                    </p>
                  </div>
                </div>
              </div>

              {/* Light Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium opacity-60" style={{ color: theme.text }}>
                  Theme
                </label>
                <select
                  value={currentTheme}
                  onChange={(e) => setCurrentTheme(e.target.value)}
                  className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:ring-1 backdrop-blur-sm"
                  style={{ 
                    color: theme.text,
                    border: `1px solid ${theme.accent}15`,
                    focusRing: `${theme.accent}30`
                  }}
                >
                  <option value="classic">🎭 Classic Elegance</option>
                  <option value="modern">🚀 Modern Minimalist</option>
                  <option value="boho">🌸 Boho Chic</option>
                </select>
              </div>
            </div>

            {/* Light Navigation Items */}
            <div className="flex-1 px-6 py-2 space-y-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const shouldAnimate = mobileMenuOpen; // Show all items when menu is open
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => handleMobileNavClick(item.path, index)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive ? 'scale-105' : 'hover:scale-102'
                    } ${shouldAnimate ? 'animate-slide-in-right opacity-100' : 'opacity-0 translate-x-8'}`}
                    style={{ 
                      background: isActive 
                        ? `linear-gradient(135deg, ${theme.accent}15, ${theme.accent}08)` 
                        : 'transparent',
                      animationDelay: `${index * 50}ms`,
                      color: isActive ? theme.accent : theme.text
                    }}
                  >
                    {/* Light background hover effect */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(135deg, ${theme.accent}08, ${theme.accent}03)` }}
                    />
                    
                    {/* Icon */}
                    <div className="relative z-10">
                      <Icon 
                        className="w-4 h-4"
                      />
                    </div>
                    
                    {/* Label */}
                    <span 
                      className="relative z-10 font-medium text-sm flex-1"
                      style={{ fontFamily: theme.fontSecondary }}
                    >
                      {item.label}
                    </span>
                    
                    {/* Light arrow indicator */}
                    <ChevronRight 
                      className={`w-3 h-3 transition-all duration-300 ${
                        isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
                      }`}
                    />
                    
                    {/* Subtle active indicator */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-6 rounded-r-full animate-scale-in"
                        style={{ background: theme.accent }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Light Menu Footer */}
            <div className="p-6">
              <div className="text-center space-y-2">
                <p className="text-xs opacity-50" style={{ color: theme.textLight }}>
                  Join us in celebrating our special day
                </p>
                <div className="flex justify-center gap-2">
                  {[Heart, Sparkles, Star].map((Icon, i) => (
                    <Icon 
                      key={i}
                      className="w-3 h-3 opacity-40" 
                      style={{ 
                        color: theme.accent
                      }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;