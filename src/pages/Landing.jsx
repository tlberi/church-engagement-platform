import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Auto-redirect if already logged in
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGetStarted = () => {
    navigate(currentUser ? '/dashboard' : '/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Sci-fi background particles */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-xl animate-bounce"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 lg:px-8 text-center text-white">
        {/* Church Icon */}
        <div className="mb-12">
          <div className="text-8xl animate-bounce">⛪</div>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-8 leading-tight">
          Church Engagement
          <span className="block text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-emerald-400 to-blue-400">Platform</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl lg:text-3xl text-blue-100/90 max-w-4xl mx-auto mb-12 leading-relaxed opacity-90">
          Transform your church community with real-time attendance tracking, 
          engagement insights, risk monitoring, and spiritual growth journeys.
        </p>

        {/* Motivational Quote */}
        <blockquote className="text-lg md:text-xl text-blue-200/80 italic max-w-2xl mx-auto mb-16 p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
          "Go therefore and make disciples of all nations... tracking every soul with love and technology."
          <cite className="block mt-4 text-sm opacity-75 font-semibold">- Matthew 28:19 + AI</cite>
        </blockquote>

        {/* Sci-fi Get Started Button */}
        <div className="group relative">
          <button
            onClick={handleGetStarted}
            className="relative px-12 py-8 text-xl font-bold text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 hover:from-emerald-600 hover:to-blue-700 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-4">
              🚀 Get Started
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            
            {/* Sci-fi glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-blue-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -skew-x-12 -rotate-3 blur-md animate-shimmer opacity-75 pointer-events-none"></div>
            <div className="absolute -inset-2 bg-gradient-radial from-emerald-400 to-blue-500 rounded-3xl blur-xl opacity-30 animate-pulse pointer-events-none"></div>
          </button>
          
          {/* Pulse ring */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-purple-500/30 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 animate-ping pointer-events-none"></div>
        </div>

        {/* Features grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          <div className="group p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-4">
            <div className="text-4xl mb-6">✅</div>
            <h3 className="text-2xl font-bold mb-4">Real-time Attendance</h3>
            <p className="text-blue-100">QR check-ins, live stats, never miss a member</p>
          </div>
          
          <div className="group p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-4">
            <div className="text-4xl mb-6">🚨</div>
            <h3 className="text-2xl font-bold mb-4">Risk Monitoring</h3>
            <p className="text-blue-100">AI detects disengagement before they drift away</p>
          </div>
          
          <div className="group p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-4">
            <div className="text-4xl mb-6">📈</div>
            <h3 className="text-2xl font-bold mb-4">Growth Tracking</h3>
            <p className="text-blue-100">Milestones, spiritual progress, community health</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-12 border-t border-white/10">
          <p className="text-blue-300 text-lg">Powered by AI + Faith</p>
          <p className="text-sm text-blue-500 mt-2 opacity-75">v2.0 - Ready for heavenly deployment</p>
        </div>
      </div>

      {/* Custom CSS for shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skew-x(-12deg); }
          100% { transform: translateX(100%) skew-x(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}

