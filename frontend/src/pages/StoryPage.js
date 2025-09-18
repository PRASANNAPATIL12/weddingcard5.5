import React from 'react';
import { useAppTheme } from '../App';
import { Heart, Calendar, MapPin, Star } from 'lucide-react';

const StoryPage = () => {
  const { themes, currentTheme } = useAppTheme();
  const theme = themes[currentTheme];

  const timeline = [
    {
      year: "2019",
      title: "First Meeting",
      description: "We met at a coffee shop in downtown San Francisco on a rainy Tuesday morning. Sarah ordered a lavender latte, and Michael couldn't stop staring at her beautiful smile.",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop"
    },
    {
      year: "2020",
      title: "First Date",
      description: "Our first official date was a sunset picnic in Golden Gate Park. We talked for hours about our dreams, travels, and favorite books under the stars.",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop"
    },
    {
      year: "2021",
      title: "Moving In Together",
      description: "After a year of long-distance dating, we decided to take the next step and move in together. Our first apartment was tiny but filled with so much love.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
    },
    {
      year: "2023",
      title: "The Proposal",
      description: "Michael proposed during our vacation in Santorini, Greece. As the sun set over the Aegean Sea, he got down on one knee with Sarah's grandmother's ring.",
      image: "https://images.unsplash.com/photo-1597248374161-426f3d6f1f6b?w=600&h=400&fit=crop"
    },
    {
      year: "2025",
      title: "Our Wedding Day",
      description: "And now, we're ready to say 'I do' surrounded by our family and friends. This is just the beginning of our beautiful journey together.",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop"
    }
  ];

  return (
    <div 
      className="min-h-screen pt-20 pb-16 px-8"
      style={{ background: theme.gradientPrimary }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 
            className="text-6xl font-light mb-6"
            style={{ 
              fontFamily: theme.fontPrimary,
              color: theme.primary 
            }}
          >
            Our Love Story
          </h1>
          <div 
            className="w-24 h-0.5 mx-auto mb-8"
            style={{ background: theme.accent }}
          />
          <p 
            className="text-xl leading-relaxed max-w-3xl mx-auto"
            style={{ color: theme.textLight }}
          >
            Every love story is beautiful, but ours is our favorite. Here's how our journey began and the milestones that brought us to this magical moment.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full hidden md:block"
            style={{ background: `linear-gradient(to bottom, ${theme.accent}, transparent)` }}
          />

          {timeline.map((item, index) => (
            <div key={index} className="relative mb-16 md:mb-24">
              <div className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}>
                {/* Content */}
                <div className="flex-1 md:w-1/2">
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
                        style={{ 
                          background: theme.gradientAccent,
                          color: theme.primary
                        }}
                      >
                        {item.year}
                      </div>
                      <Heart 
                        className="w-6 h-6"
                        style={{ color: theme.accent }}
                      />
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
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div 
                    className="w-6 h-6 rounded-full border-4 border-white"
                    style={{ background: theme.accent }}
                  />
                </div>

                {/* Image */}
                <div className="flex-1 md:w-1/2">
                  <div className="relative overflow-hidden rounded-3xl aspect-[4/3] group">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote Section */}
        <div className="text-center mt-20">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
            <Star 
              className="w-12 h-12 mx-auto mb-6"
              style={{ color: theme.accent }}
            />
            <blockquote 
              className="text-3xl font-light italic mb-6 max-w-4xl mx-auto leading-relaxed"
              style={{ 
                fontFamily: theme.fontPrimary,
                color: theme.primary 
              }}
            >
              "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage."
            </blockquote>
            <cite 
              className="text-lg font-medium"
              style={{ color: theme.textLight }}
            >
              — Lao Tzu
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPage;