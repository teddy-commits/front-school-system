import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  Globe,
  Clock,
  UserCheck,
  TrendingUp,
  Heart,
  Sparkles,
  Building2,
  Laptop,
  Microscope,
  Music,
  Trophy,
  Shield,
  ExternalLink
} from 'lucide-react';
import { 
  FaFacebook as Facebook, 
  FaXTwitter as Twitter, 
  FaLinkedin as Linkedin, 
  FaInstagram as Instagram 
} from 'react-icons/fa6'; 





const Homepage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: '15,000+', label: 'Students', icon: Users },
    { value: '500+', label: 'Faculty Members', icon: UserCheck },
    { value: '120+', label: 'Programs', icon: BookOpen },
    { value: '95%', label: 'Graduation Rate', icon: Award },
  ];

  const programs = [
    { name: 'Computer Science', degree: 'B.Sc, M.Sc, PhD', duration: '4 Years', icon: Laptop },
    { name: 'Software Engineering', degree: 'B.Sc, M.Sc', duration: '4 Years', icon: Code },
    { name: 'Business Administration', degree: 'BBA, MBA', duration: '4 Years', icon: TrendingUp },
    { name: 'Electrical Engineering', degree: 'B.Sc, M.Sc', duration: '5 Years', icon: Microscope },
  ];

  const features = [
    { title: 'World-Class Faculty', description: 'Learn from industry experts and renowned academics', icon: Award },
    { title: 'Modern Campus', description: 'State-of-the-art facilities and learning environment', icon: Building2 },
    { title: 'Global Recognition', description: 'Degrees recognized worldwide', icon: Globe },
    { title: 'Career Support', description: '99% job placement within 6 months', icon: Trophy },
  ];

  const news = [
    { date: 'March 15, 2024', title: 'Admas University Ranked Top 10 in Africa', category: 'Achievement' },
    { date: 'March 10, 2024', title: 'New Research Center Inaugurated', category: 'Campus' },
    { date: 'March 5, 2024', title: 'International Conference on AI', category: 'Event' },
  ];

  const campusHighlights = [
    { title: '24/7 Library Access', description: 'Million+ books and digital resources' },
    { title: 'Smart Classrooms', description: 'Technology-enabled learning spaces' },
    { title: 'Sports Complex', description: 'Olympic-size pool and stadium' },
    { title: 'Student Housing', description: 'Modern dormitories with amenities' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className={`w-8 h-8 ${scrolled ? 'text-blue-600' : 'text-white'}`} />
              <span className={`text-xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                Admas University
              </span>
            </Link>

           
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className={`${scrolled ? 'text-gray-600' : 'text-white'} hover:text-blue-500 transition`}>Home</a>
              <a href="#about" className={`${scrolled ? 'text-gray-600' : 'text-white'} hover:text-blue-500 transition`}>About</a>
              <a href="#programs" className={`${scrolled ? 'text-gray-600' : 'text-white'} hover:text-blue-500 transition`}>Programs</a>
              <a href="#admissions" className={`${scrolled ? 'text-gray-600' : 'text-white'} hover:text-blue-500 transition`}>Admissions</a>
              <a href="#campus" className={`${scrolled ? 'text-gray-600' : 'text-white'} hover:text-blue-500 transition`}>Campus</a>
              
              
              <Link
                to="/login/staff"
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  scrolled 
                    ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white' 
                    : 'border-2 border-white text-white hover:bg-white hover:text-blue-600'
                }`}
              >
                Staff Login
              </Link>
              <Link
                to="/login/student"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg"
              >
                Student Portal
              </Link>
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden ${scrolled ? 'text-gray-800' : 'text-white'}`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <a href="#home" className="block text-gray-600 hover:text-blue-600 py-2">Home</a>
              <a href="#about" className="block text-gray-600 hover:text-blue-600 py-2">About</a>
              <a href="#programs" className="block text-gray-600 hover:text-blue-600 py-2">Programs</a>
              <a href="#admissions" className="block text-gray-600 hover:text-blue-600 py-2">Admissions</a>
              <a href="#campus" className="block text-gray-600 hover:text-blue-600 py-2">Campus</a>
              <Link to="/login/staff" className="block w-full text-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition">
                Staff Login
              </Link>
              <Link to="/login/student" className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Student Portal
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/80" />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 animate-float">
            <GraduationCap className="w-12 h-12 text-white/20" />
          </div>
          <div className="absolute bottom-40 right-20 animate-float-delayed">
            <BookOpen className="w-16 h-16 text-white/20" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-pulse-slow">
            <Sparkles className="w-8 h-8 text-yellow-300/30" />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Excellence in Education Since 1995
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Shape Your Future at
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admas University
            </span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Empowering minds, transforming lives through quality education, 
            innovation, and research excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login/student"
              className="group inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <span>Access Student Portal</span>
              <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Apply Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white" />
        </div>
      </section>

      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Admas University?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide world-class education with a focus on practical skills and global opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                  <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Academic Programs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from a wide range of undergraduate and graduate programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program, index) => (
              <div key={index} className="border border-gray-100 rounded-xl p-6 hover:shadow-lg transition cursor-pointer group">
                <program.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{program.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{program.degree}</p>
                <p className="text-gray-400 text-sm">Duration: {program.duration}</p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition">
                  <button className="text-blue-600 text-sm font-medium flex items-center">
                    Learn More <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition">
              View All Programs
            </button>
          </div>
        </div>
      </section>
      <section id="campus" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Campus
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              State-of-the-art facilities designed for excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {campusHighlights.map((highlight, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white border border-white/20">
                <CheckCircle className="w-8 h-8 text-green-300 mb-3" />
                <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
                <p className="text-blue-100 text-sm">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Latest News
            </h2>
            <p className="text-gray-600">Stay updated with university happenings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-blue-600 font-semibold">{item.category}</span>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <button className="text-blue-600 text-sm font-medium flex items-center mt-4">
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Join thousands of successful graduates who started their careers at Admas University
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Apply Now
            </Link>
            <Link
              to="/login/student"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Student Portal
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold text-white">Admas University</span>
              </div>
              <p className="text-sm">
                Empowering minds, transforming lives through quality education and innovation.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="hover:text-blue-400 transition"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="hover:text-blue-400 transition"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-blue-400 transition"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="hover:text-blue-400 transition"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-blue-400 transition">About Us</a></li>
                <li><a href="#programs" className="hover:text-blue-400 transition">Academics</a></li>
                <li><a href="#admissions" className="hover:text-blue-400 transition">Admissions</a></li>
                <li><a href="#campus" className="hover:text-blue-400 transition">Campus Life</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">Library</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Career Services</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Student Portal</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Faculty Portal</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Bole Road, Addis Ababa
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" /> +251-111-234567
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> info@admas.edu.et
                </li>
                <li className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Mon-Fri: 8:00 - 17:00
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Admas University. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const Code = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export default Homepage;