import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import emblemImg from '../../assets/emblem.png';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email credentials or inactive account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (selectedEmail) => {
    setEmail(selectedEmail);
    setPassword('password123');
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* Official Government Tricolor Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 flex z-50">
        <div className="flex-1 bg-[#FF9933]"></div> {/* Saffron */}
        <div className="flex-1 bg-white"></div>       {/* White */}
        <div className="flex-1 bg-[#138808]"></div> {/* Green */}
      </div>

      {/* Official Gov Accessibility Top-Header */}
      <div className="w-full bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 py-1.5 px-4 sm:px-6 lg:px-8 flex justify-between items-center select-none shrink-0 pt-2">
        <div className="flex items-center gap-3 font-semibold uppercase tracking-wider">
          <span>भारत सरकार</span>
          <span className="text-slate-300">|</span>
          <span>Government of India</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-medium">
          <a href="#main" className="hover:text-slate-800">Skip to main content</a>
          <span className="text-slate-350">|</span>
          <a href="#accessibility" className="hover:text-slate-800">Accessibility Options</a>
          <span className="text-slate-350">|</span>
          <span className="font-semibold text-slate-700">English</span>
        </div>
      </div>

      {/* Core Login Container */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          
          {/* Official Emblem & Portal Title */}
          <div className="flex flex-col items-center text-center">
            
            <img 
              src={emblemImg} 
              alt="State Emblem of India" 
              className="h-24 w-auto mb-3" 
            />

            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              PackSure
            </h2>
            
            <div className="mt-1 flex flex-col gap-0.5 text-xs text-slate-500 font-medium">
              <span className="uppercase text-[10px] font-bold text-slate-650 tracking-wider">
                Legal Metrology Compliance System
              </span>
              <span>
                Department of Consumer Affairs
              </span>
              <span className="text-[10px] text-slate-400">
                Ministry of Consumer Affairs, Food & Public Distribution
              </span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-xs">
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Error Message Alert */}
              {error && (
                <div className="rounded border border-rose-200 bg-rose-50/55 p-3 flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Official Email ID
                </label>
                <div className="mt-1.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded border border-slate-250 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:outline-hidden focus:ring-1 focus:ring-blue-700 transition-colors"
                    placeholder="name@gov.in"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#forgot" className="text-xs font-semibold text-blue-750 hover:text-blue-850">
                    Forgot password?
                  </a>
                </div>
                <div className="mt-1.5 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded border border-slate-250 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-700 focus:outline-hidden focus:ring-1 focus:ring-blue-700 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-450 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-750"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 font-medium">
                  Keep me signed in
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-700 disabled:bg-slate-300 transition-colors"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Secure Login'
                  )}
                </button>
              </div>
            </form>

            {/* Quick-Login Panel */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2.5">
                Evaluation Test Credentials
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleQuickLogin('ramesh.kumar@gov.in')}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-1.5 text-left text-xs hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Ramesh Kumar</span>
                    <span className="text-[10px] text-slate-400 block">ramesh.kumar@gov.in</span>
                  </div>
                  <span className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                    Admin
                  </span>
                </button>

                <button
                  onClick={() => handleQuickLogin('priya.sharma@gov.in')}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-1.5 text-left text-xs hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Priya Sharma</span>
                    <span className="text-[10px] text-slate-400 block">priya.sharma@gov.in</span>
                  </div>
                  <span className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                    Officer
                  </span>
                </button>

                <button
                  onClick={() => handleQuickLogin('anil.mehta@gov.in')}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-1.5 text-left text-xs hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-800">Anil Mehta</span>
                    <span className="text-[10px] text-slate-400 block">anil.mehta@gov.in</span>
                  </div>
                  <span className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                    Inspector
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* Secure Portal Footnote */}
          <div className="text-center text-[10px] text-slate-400 select-none">
            This is a secure Government of India portal. Unauthorized access is strictly prohibited.
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
