import React, { useState, useEffect } from 'react';
import { useAppTheme } from '../App';
import { useUserData } from '../contexts/UserDataContext';
import { Heart, MessageCircle, User, Send, Star, Loader } from 'lucide-react';

const GuestbookPage = () => {
  const { themes, currentTheme } = useAppTheme();
  const theme = themes[currentTheme];
  
  const [newMessage, setNewMessage] = useState({
    name: '',
    message: '',
    relationship: ''
  });

  const [messages] = useState([
    {
      id: 1,
      name: "Emily Johnson",
      relationship: "Sister of the Bride",
      message: "Sarah, watching you find your perfect match in Michael fills my heart with so much joy. You two are meant to be together, and I can't wait to see all the beautiful adventures ahead of you. Love you both!",
      date: "2 days ago"
    },
    {
      id: 2,
      name: "David Thompson",
      relationship: "Brother of the Groom",
      message: "Michael, you've found your person, and it shows in everything you do. Sarah brings out the best in you, and together you're unstoppable. Wishing you a lifetime of happiness and laughter!",
      date: "3 days ago"
    },
    {
      id: 3,
      name: "Jessica Chen",
      relationship: "College Friend",
      message: "From our dorm room talks about finding 'the one' to watching you walk down the aisle - this moment is everything you dreamed of and more. You and Michael are perfect together. Congratulations!",
      date: "5 days ago"
    },
    {
      id: 4,
      name: "Ryan Mitchell",
      relationship: "College Buddy",
      message: "Mike, remember when you first told me about Sarah? Your whole face lit up. That light has never faded, and now I know why. You two are incredible together. Here's to your happily ever after!",
      date: "1 week ago"
    },
    {
      id: 5,
      name: "Amanda Rodriguez",
      relationship: "Work Friend",
      message: "Sarah, you deserve all the happiness in the world, and Michael is clearly the one to give it to you. Your love story gives me hope and makes me believe in true love. Congratulations to you both!",
      date: "1 week ago"
    },
    {
      id: 6,
      name: "James Park",
      relationship: "Colleague",
      message: "Michael talks about Sarah with such love and admiration. It's beautiful to see two people so perfectly matched. Wishing you both a marriage filled with love, laughter, and endless adventures!",
      date: "2 weeks ago"
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save to database
    console.log('New message:', newMessage);
    setNewMessage({ name: '', message: '', relationship: '' });
    // Show success message
    alert('Thank you for your beautiful message! It means the world to us.');
  };

  const handleChange = (e) => {
    setNewMessage({
      ...newMessage,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div 
      className="min-h-screen pt-20 pb-16 px-8"
      style={{ background: theme.gradientPrimary }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-6xl font-light mb-6"
            style={{ 
              fontFamily: theme.fontPrimary,
              color: theme.primary 
            }}
          >
            Guestbook
          </h1>
          <div 
            className="w-24 h-0.5 mx-auto mb-8"
            style={{ background: theme.accent }}
          />
          <p 
            className="text-xl leading-relaxed max-w-3xl mx-auto"
            style={{ color: theme.textLight }}
          >
            Leave us a message of love, laughter, or your favorite memory with us. 
            Your words will become treasured keepsakes from our special day.
          </p>
        </div>

        {/* Message Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: theme.gradientAccent }}
            >
              <MessageCircle className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <h2 
              className="text-3xl font-semibold"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Leave a Message
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-semibold tracking-wider mb-3"
                  style={{ color: theme.text }}
                >
                  Your Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 w-5 h-5 opacity-50" style={{ color: theme.textLight }} />
                  <input
                    type="text"
                    name="name"
                    required
                    value={newMessage.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-6 py-4 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300"
                    style={{ 
                      color: theme.text,
                      borderColor: `${theme.accent}40`
                    }}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-semibold tracking-wider mb-3"
                  style={{ color: theme.text }}
                >
                  Your Relationship
                </label>
                <input
                  type="text"
                  name="relationship"
                  value={newMessage.relationship}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300"
                  style={{ 
                    color: theme.text,
                    borderColor: `${theme.accent}40`
                  }}
                  placeholder="e.g., Friend, Family, Colleague"
                />
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-semibold tracking-wider mb-3"
                style={{ color: theme.text }}
              >
                Your Message *
              </label>
              <textarea
                name="message"
                required
                value={newMessage.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-6 py-4 rounded-xl bg-white/20 border border-white/30 focus:border-opacity-50 transition-all duration-300 resize-none"
                style={{ 
                  color: theme.text,
                  borderColor: `${theme.accent}40`
                }}
                placeholder="Share your thoughts, wishes, or favorite memories with Sarah & Michael..."
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold tracking-wider transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: theme.gradientAccent,
                  color: theme.primary
                }}
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Messages Display */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <Heart className="w-8 h-8" style={{ color: theme.accent }} />
            <h2 
              className="text-3xl font-semibold"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              Messages from Our Loved Ones
            </h2>
          </div>

          <div className="space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg"
                    style={{ 
                      background: theme.gradientAccent,
                      color: theme.primary 
                    }}
                  >
                    {message.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div>
                        <h3 
                          className="text-xl font-semibold"
                          style={{ color: theme.primary }}
                        >
                          {message.name}
                        </h3>
                        {message.relationship && (
                          <p 
                            className="text-sm opacity-80"
                            style={{ color: theme.textLight }}
                          >
                            {message.relationship}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Star className="w-4 h-4" style={{ color: theme.accent }} />
                        <span 
                          className="text-sm"
                          style={{ color: theme.textLight }}
                        >
                          {message.date}
                        </span>
                      </div>
                    </div>
                    
                    <p 
                      className="text-lg leading-relaxed"
                      style={{ color: theme.textLight }}
                    >
                      "{message.message}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thank You Note */}
        <div className="text-center mt-16">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
            <Heart 
              className="w-16 h-16 mx-auto mb-6"
              style={{ color: theme.accent }}
            />
            <p 
              className="text-2xl font-light italic leading-relaxed max-w-3xl mx-auto"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              "Thank you for sharing your love and warm wishes with us. Each message is a precious gift that we'll treasure forever."
            </p>
            <p 
              className="text-lg mt-6 font-medium"
              style={{ color: theme.textLight }}
            >
              With all our love,<br />
              Sarah & Michael
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestbookPage;