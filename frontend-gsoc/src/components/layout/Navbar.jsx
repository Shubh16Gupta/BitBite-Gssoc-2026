// src/components/layout/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  LogOut, 
  BookOpen, 
  Users, 
  Building, 
  ChevronDown,
  Sprout,
  Home,
  Info,
  LayoutDashboard,
  Shield,
  UserCog
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import LanguageToggle from "../common/LanguageToggle";
import logo from "../../assets/logo.png";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showFarmersDropdown, setShowFarmersDropdown] = useState(false);
  const [showBanksDropdown, setShowBanksDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { t } = useTranslation()

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowFarmersDropdown(false);
      setShowBanksDropdown(false);
      setShowAdminDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const navLink =
    "relative whitespace-nowrap text-[15px] font-medium text-secondary-700 transition-all duration-300 hover:text-green-700 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full";

  const dropdownLink =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-secondary-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200";

  return (
    <>
      {/* ✅ Top Blur Effect - Glassmorphism gradient at the top */}
      <div className="fixed top-0 left-0 right-0 z-40 h-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-white/80 via-white/40 to-transparent backdrop-blur-[2px]" />
      </div>

      <nav
        className={`
        fixed
        top-5
        left-1/2
        -translate-x-1/2
        z-50

        w-[92%]
        max-w-7xl

        rounded-2xl

        transition-all
        duration-500

        ${
          scrolled
            ? `
              bg-white/55
              backdrop-blur-3xl
              backdrop-saturate-[180%]
              border border-white/30
              shadow-[0_12px_35px_rgba(0,0,0,0.10)]
            `
            : `
              bg-white/30
              backdrop-blur-2xl
              backdrop-saturate-150
              border border-white/20
            `
        }
      `}
      >
        <div className="px-5 lg:px-8 xl:px-12">
          <div
            className={`flex items-center transition-all duration-500 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            {/* Logo */}
            <div
              className={`
              flex items-center
              overflow-hidden
              transition-all
              duration-500
              ease-in-out
              ${
                scrolled
                  ? "w-0 opacity-0 scale-75 mr-0"
                  : "w-40 opacity-100 scale-100 mr-10"
              }
            `}
            >
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="FarmTrust"
                  className="h-25 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center gap-5 lg:gap-7">
                <Link to="/" className={navLink}>
                  <Home className="h-4 w-4 inline mr-1" />
                  {t('nav.home')}
                </Link>

                <Link to="/about" className={navLink}>
                  <Info className="h-4 w-4 inline mr-1" />
                  {t('nav.about')}
                </Link>

                {/* For Farmers Dropdown */}
                {(!isAuthenticated || user?.role === 'farmer') && (
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowFarmersDropdown(true)}
                    onMouseLeave={() => setShowFarmersDropdown(false)}
                  >
                    <button 
                      className={`${navLink} flex items-center gap-1 whitespace-nowrap`}
                      onClick={() => setShowFarmersDropdown(!showFarmersDropdown)}
                    >
                      <Users className="h-4 w-4" />
                      For Farmers
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showFarmersDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showFarmersDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 py-2 overflow-hidden">
                        {!isAuthenticated ? (
                          <>
                            <Link 
                              to="/farmer/signup" 
                              className={dropdownLink}
                              onClick={() => setShowFarmersDropdown(false)}
                            >
                              <Sprout className="h-4 w-4 text-green-600" />
                              Register as Farmer
                            </Link>
                            <Link 
                              to="/login" 
                              className={dropdownLink}
                              onClick={() => setShowFarmersDropdown(false)}
                            >
                              <LayoutDashboard className="h-4 w-4 text-blue-600" />
                              Farmer Login
                            </Link>
                          </>
                        ) : user?.role === 'farmer' && (
                          <>
                            <Link 
                              to="/farmer" 
                              className={dropdownLink}
                              onClick={() => setShowFarmersDropdown(false)}
                            >
                              <LayoutDashboard className="h-4 w-4 text-blue-600" />
                              Farmer Dashboard
                            </Link>
                            <Link 
                              to="/farmer/schemes" 
                              className={dropdownLink}
                              onClick={() => setShowFarmersDropdown(false)}
                            >
                              <BookOpen className="h-4 w-4 text-purple-600" />
                              Government Schemes
                            </Link>
                            <div className="border-t border-slate-200/50 my-1"></div>
                            <Link 
                              to="/farmer/apply-loan" 
                              className={dropdownLink}
                              onClick={() => setShowFarmersDropdown(false)}
                            >
                              <Sprout className="h-4 w-4 text-emerald-600" />
                              Apply for Loan
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* For Banks Dropdown */}
                {(!isAuthenticated || user?.role === 'bank') && (
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowBanksDropdown(true)}
                    onMouseLeave={() => setShowBanksDropdown(false)}
                  >
                    <button 
                      className={`${navLink} flex items-center gap-1 whitespace-nowrap`}
                      onClick={() => setShowBanksDropdown(!showBanksDropdown)}
                    >
                      <Building className="h-4 w-4" />
                      For Banks
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showBanksDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showBanksDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 py-2 overflow-hidden">
                        {!isAuthenticated ? (
                          <>
                            <Link 
                              to="/bank/login" 
                              className={dropdownLink}
                              onClick={() => setShowBanksDropdown(false)}
                            >
                              <Building className="h-4 w-4 text-blue-600" />
                              Bank Login
                            </Link>
                            <Link 
                              to="/bank/register" 
                              className={dropdownLink}
                              onClick={() => setShowBanksDropdown(false)}
                            >
                              <Building className="h-4 w-4 text-emerald-600" />
                              Register Your Bank
                            </Link>
                          </>
                        ) : user?.role === 'bank' && (
                          <>
                            <Link 
                              to="/bank" 
                              className={dropdownLink}
                              onClick={() => setShowBanksDropdown(false)}
                            >
                              <LayoutDashboard className="h-4 w-4 text-blue-600" />
                              Bank Dashboard
                            </Link>
                            <Link 
                              to="/bank/requests" 
                              className={dropdownLink}
                              onClick={() => setShowBanksDropdown(false)}
                            >
                              <BookOpen className="h-4 w-4 text-purple-600" />
                              Loan Requests
                            </Link>
                            <div className="border-t border-slate-200/50 my-1"></div>
                            <Link 
                              to="/bank/monitoring" 
                              className={dropdownLink}
                              onClick={() => setShowBanksDropdown(false)}
                            >
                              <LayoutDashboard className="h-4 w-4 text-blue-600" />
                              Monitoring
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Dropdown */}
                {(!isAuthenticated || user?.role === 'admin') && (
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowAdminDropdown(true)}
                    onMouseLeave={() => setShowAdminDropdown(false)}
                  >
                    <button 
                      className={`${navLink} flex items-center gap-1 text-purple-700 hover:text-purple-800 after:bg-purple-600`}
                      onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showAdminDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showAdminDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 py-2 overflow-hidden">
                        {!isAuthenticated ? (
                          <>
                            <Link 
                              to="/admin/login" 
                              className={dropdownLink}
                              onClick={() => setShowAdminDropdown(false)}
                            >
                              <Shield className="h-4 w-4 text-purple-600" />
                              Admin Login
                            </Link>
                          </>
                        ) : user?.role === 'admin' && (
                          <>
                            <Link 
                              to="/admin" 
                              className={dropdownLink}
                              onClick={() => setShowAdminDropdown(false)}
                            >
                              <LayoutDashboard className="h-4 w-4 text-purple-600" />
                              Admin Dashboard
                            </Link>
                            <Link 
                              to="/admin/banks" 
                              className={dropdownLink}
                              onClick={() => setShowAdminDropdown(false)}
                            >
                              <Building className="h-4 w-4 text-blue-600" />
                              Bank Management
                            </Link>
                            <Link 
                              to="/admin/users" 
                              className={dropdownLink}
                              onClick={() => setShowAdminDropdown(false)}
                            >
                              <Users className="h-4 w-4 text-green-600" />
                              User Management
                            </Link>
                            <div className="border-t border-slate-200/50 my-1"></div>
                            <Link 
                              to="/admin/reports" 
                              className={dropdownLink}
                              onClick={() => setShowAdminDropdown(false)}
                            >
                              <BookOpen className="h-4 w-4 text-purple-600" />
                              Reports
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Link to="/directory" className={`${navLink} flex items-center gap-2`}>
                  <BookOpen className="h-4 w-4" />
                  {t('nav.directory')}
                </Link>

                {isAuthenticated && (
                  <Link to={`/${user?.role}`} className={navLink}>
                    <LayoutDashboard className="h-4 w-4 inline mr-1" />
                    {t('nav.dashboard')}
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {/* Always visible, in both signed-in and signed-out states */}
              <LanguageToggle />

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="
                      px-5
                      py-2
                      rounded-full
                      text-[15px]
                      font-medium
                      text-secondary-700
                      hover:bg-white/50
                      transition-all
                      duration-300
                    "
                  >
                    {t('nav.login')}
                  </Link>

                  <Link
                    to="/farmer/signup"
                    className="
                      px-6
                      py-2.5
                      rounded-full
                      bg-green-700
                      text-white
                      font-medium
                      shadow-lg
                      hover:bg-green-800
                      hover:scale-105
                      transition-all
                      duration-300
                    "
                  >
                    {t('nav.register')}
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {user?.name}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                      {user?.role}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="
                      flex
                      items-center
                      gap-2
                      px-5
                      py-2
                      rounded-full
                      text-red-600
                      hover:bg-red-50
                      transition-all
                      duration-300
                    "
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="
                md:hidden
                h-10
                w-10
                flex
                items-center
                justify-center
                rounded-full
                bg-white/60
                backdrop-blur-xl
                border
                border-white/40
                transition-all
              "
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
              isOpen ? "max-h-[650px] opacity-100 pb-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="rounded-2xl bg-white/70 backdrop-blur-xl backdrop-saturate-150 ring-1 ring-white/50 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.15)] p-4">
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-1">
                  <Link
                    to="/"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/about"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Info className="h-4 w-4" />
                    {t('nav.about')}
                  </Link>
                  
                  <div className="px-3 py-2 text-xs font-semibold text-purple-600 uppercase tracking-wider">
                    Admin
                  </div>
                  <Link
                    to="/admin/login"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2 pl-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="h-4 w-4 text-purple-600" />
                    Admin Login
                  </Link>
                  
                  <div className="px-3 py-2 text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                    For Farmers
                  </div>
                  <Link
                    to="/farmer/signup"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2 pl-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <Sprout className="h-4 w-4 text-green-600" />
                    Register as Farmer
                  </Link>
                  <Link
                    to="/login"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2 pl-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 text-blue-600" />
                    Farmer Login
                  </Link>
                  
                  <div className="px-3 py-2 text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                    For Banks
                  </div>
                  <Link
                    to="/bank/login"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2 pl-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <Building className="h-4 w-4 text-blue-600" />
                    Bank Login
                  </Link>
                  <Link
                    to="/bank/register"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2 pl-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <Building className="h-4 w-4 text-emerald-600" />
                    Register Bank
                  </Link>

                  <Link
                    to="/directory"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    {t('nav.directory')}
                  </Link>
                  
                  <div className="border-t border-slate-200/50 my-2"></div>
                  <Link
                    to="/login"
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/farmer/signup"
                    className="mt-1 text-center px-3 py-2.5 rounded-xl text-white bg-secondary-900 hover:bg-secondary-800 font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/${user?.role}`}
                    className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t('nav.dashboard')}
                  </Link>

                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/banks"
                        className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2 pl-6"
                        onClick={() => setIsOpen(false)}
                      >
                        <Building className="h-4 w-4 text-blue-600" />
                        Bank Management
                      </Link>
                      <Link
                        to="/admin/users"
                        className="px-3 py-2.5 rounded-xl text-secondary-700 hover:bg-secondary-900/5 font-medium transition-colors flex items-center gap-2 pl-6"
                        onClick={() => setIsOpen(false)}
                      >
                        <Users className="h-4 w-4 text-green-600" />
                        User Management
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium text-left transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}