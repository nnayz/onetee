import type { FC } from "react";
import { motion } from "framer-motion";
import HamburgerMenu from "@/components/HamburgerMenu";
import ScrollReveal from "@/components/ScrollReveal";

const AboutPage: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 overflow-hidden">
      {/* Hamburger Menu */}
      <HamburgerMenu />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,0,0,0.02)_0%,_transparent_50%)]"></div>
      
      {/* Main content */}
              <div className="relative z-10 pb-16 px-8 lg:px-16 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl lg:text-8xl font-extralight tracking-wider mb-8 text-gray-900">
            About Us
          </h1>
          <div className="w-24 h-px bg-gray-900 mx-auto mb-8"></div>
          <p className="text-lg font-light text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Premium quality t-shirts that bring teams together. Crafted with care, designed for unity.
          </p>
        </motion.div>

        {/* Story Section */}
        <ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="space-y-6">
              <h2 className="text-4xl font-light tracking-wide text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 font-light leading-relaxed text-lg">
                OneTee was born from a simple belief: that great teams deserve great shirts. 
                We understand that when people feel united by what they wear, magic happens.
              </p>
              <p className="text-gray-600 font-light leading-relaxed text-lg">
                Every thread is chosen with intention. Every design is crafted with purpose. 
                We don't just make t-shirts; we create the foundation for shared experiences, 
                memories, and connections that last.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-gray-100 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 font-light">Story Image</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Values Section */}
        <ScrollReveal>
          <div className="mb-32">
            <h2 className="text-4xl font-light tracking-wide text-gray-900 text-center mb-16">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-light tracking-wide text-gray-900">Quality First</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We source only the finest materials and work with skilled artisans 
                  to ensure every piece meets our exacting standards.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-light tracking-wide text-gray-900">Unity & Connection</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  Our designs bring people together, creating a sense of belonging 
                  and shared identity that transcends individual differences.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-light tracking-wide text-gray-900">Sustainability</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  We're committed to responsible practices that respect our planet 
                  and future generations who will wear our creations.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Team Section */}
        <ScrollReveal>
          <div className="mb-32">
            <h2 className="text-4xl font-light tracking-wide text-gray-900 text-center mb-16">
              Meet the Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { name: "Alex Thompson", role: "Founder & Creative Director", description: "Visionary behind OneTee's aesthetic and philosophy." },
                { name: "Sarah Chen", role: "Head of Design", description: "Transforms ideas into wearable art with meticulous attention to detail." },
                { name: "Marcus Rivera", role: "Quality Assurance", description: "Ensures every piece meets our exceptional standards." }
              ].map((member, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-sm overflow-hidden mb-6">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 font-light">{member.name}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-light tracking-wide text-gray-900">{member.name}</h3>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{member.role}</p>
                  <p className="text-gray-600 font-light leading-relaxed">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Mission Section */}
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-4xl font-light tracking-wide text-gray-900 mb-8">
              Our Mission
            </h2>
            <div className="w-24 h-px bg-gray-900 mx-auto mb-8"></div>
            <p className="text-xl font-light text-gray-600 max-w-4xl mx-auto leading-relaxed">
              To create premium apparel that strengthens communities, celebrates individuality within unity, 
              and proves that the simplest things—like a well-made t-shirt—can have the most profound impact 
              on how we connect with one another.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default AboutPage;