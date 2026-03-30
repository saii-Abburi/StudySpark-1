import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Home, 
  Upload, 
  Library, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Bell,
  Search,
  Users,
  AlertTriangle,
  Layers,
  BookMarked,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Plus,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for expandable menus
  const [testsExpanded, setTestsExpanded] = useState(false);
  const [mockExpanded, setMockExpanded] = useState(false);
  const [chapterExpanded, setChapterExpanded] = useState(false);
  const [materialsExpanded, setMaterialsExpanded] = useState(false);

  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    
    // Student specific routes
    ...(user?.role === 'student' ? [
      { name: 'Flashcards', path: '/dashboard/flashcards', icon: <Layers className="h-5 w-5" /> },
      { name: 'Bookmarks', path: '/dashboard/bookmarks', icon: <BookMarked className="h-5 w-5" /> },
    ] : []),

    { name: 'Materials & Resources', path: '/dashboard/materials', icon: <Library className="h-5 w-5" />, expandable: true },
    
    // Instructor specific routes
    ...(user?.role === 'instructor' || user?.role === 'admin' ? [
      { name: 'Student Reports', path: '/dashboard/reports', icon: <AlertTriangle className="h-5 w-5" /> },
    ] : []),
    
    // Only show upload and manage users to admin/instructors
    ...(user?.role === 'admin' || user?.role === 'instructor' ? [
      { name: 'Upload Files', path: '/dashboard/upload', icon: <Upload className="h-5 w-5" /> },
    ] : []),
    ...(user?.role === 'admin' ? [
      { name: 'Manage Users', path: '/dashboard/users', icon: <Users className="h-5 w-5" /> },
    ] : []),
    { name: '45 Days Plan', path: '/dashboard/plan-45', icon: <Calendar className="h-5 w-5" /> },
    { name: '30 Days Plan', path: '/dashboard/plan-30', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Sidebar overlay (Mobile only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-dark-900 border-r border-dark-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo - Hidden on desktop as requested */}
          <div className="lg:hidden flex items-center justify-between h-20 px-6 border-b border-dark-800">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-black uppercase text-white tracking-tight">
                Study<span className="text-primary-500">Spark</span>
              </span>
            </Link>
            <button className="text-slate-300 hover:text-white" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Profile Summary */}
          <div className="p-6 border-b border-dark-800">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-dark-800 border border-dark-700 flex items-center justify-center text-primary-500 font-bold text-lg uppercase">
                {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
              </div>
              <div>
                <p className="text-sm font-bold text-white capitalize truncate w-40 tracking-wider">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-primary-500 font-medium uppercase tracking-widest mt-1">{user?.role || 'Student'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <React.Fragment key={item.name}>
                  <Link
                    to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 transition-all ${
                    isActive 
                    ? 'bg-primary-500/10 text-primary-500 border-r-2 border-primary-500 font-bold tracking-wider' 
                    : 'text-slate-200 hover:bg-dark-800 hover:text-white font-medium tracking-wide'
                  }`}
                >
                  <span className={`${isActive ? 'text-primary-500' : 'text-slate-300'} mr-3`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
                
                {/* Removed expandable sub-nav for Materials & Resources as requested */}

                {/* Inject Tests immediately after Overview for students */}
                {item.name === 'Overview' && user?.role === 'student' && (
                  <div className="pt-2 pb-2 block border-b border-dark-800/50 mb-2">
                    <button 
                      onClick={() => setTestsExpanded(!testsExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 text-slate-200 hover:bg-dark-800 hover:text-white font-medium tracking-wide transition-all"
                    >
                      <div className="flex items-center">
                        <ClipboardList className="h-5 w-5 mr-3 text-slate-300" />
                        Tests
                      </div>
                      <Plus 
                        className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                          testsExpanded ? 'rotate-[225deg] text-primary-500' : 'rotate-0 text-slate-300'
                        }`} 
                      />
                    </button>
                    
                    {testsExpanded && (
                      <div className="pl-12 pr-4 space-y-1 mt-1 border-l-2 border-dark-800 ml-6">
                        {/* Mock Tests */}
                        <button 
                          onClick={() => setMockExpanded(!mockExpanded)}
                          className="w-full flex items-center justify-between py-2 text-sm text-slate-200 hover:text-white transition-colors"
                        >
                          <span>Mock Tests</span>
                          <Plus 
                            className={`h-3 w-3 transition-transform duration-300 ease-in-out ${
                              mockExpanded ? 'rotate-[225deg] text-primary-500' : 'rotate-0 text-slate-200'
                            }`} 
                          />
                        </button>
                        {mockExpanded && (
                          <div className="pl-4 space-y-1 mb-2">
                            <Link to="/dashboard/tests/mock/agriculture" onClick={() => setIsOpen(false)} className="block py-1.5 text-xs text-slate-300 hover:text-primary-500">Agriculture</Link>
                            <Link to="/dashboard/tests/mock/engineering" onClick={() => setIsOpen(false)} className="block py-1.5 text-xs text-slate-300 hover:text-primary-500">Engineering</Link>
                          </div>
                        )}
                        
                        {/* Chapter-wise Tests */}
                        <button 
                          onClick={() => setChapterExpanded(!chapterExpanded)}
                          className="w-full flex items-center justify-between py-2 text-sm text-slate-200 hover:text-white transition-colors"
                        >
                          <span>Chapter-wise</span>
                          <Plus 
                            className={`h-3 w-3 transition-transform duration-300 ease-in-out ${
                              chapterExpanded ? 'rotate-[225deg] text-primary-500' : 'rotate-0 text-slate-200'
                            }`} 
                          />
                        </button>
                        {chapterExpanded && (
                          <div className="pl-4 space-y-1 mb-2">
                            <Link to="/dashboard/tests/chapter-wise/biology" onClick={() => setIsOpen(false)} className="block py-1.5 text-xs text-slate-300 hover:text-primary-500">Biology</Link>
                            <Link to="/dashboard/tests/chapter-wise/physics" onClick={() => setIsOpen(false)} className="block py-1.5 text-xs text-slate-300 hover:text-primary-500">Physics</Link>
                            <Link to="/dashboard/tests/chapter-wise/chemistry" onClick={() => setIsOpen(false)} className="block py-1.5 text-xs text-slate-300 hover:text-primary-500">Chemistry</Link>
                            <Link to="/dashboard/tests/chapter-wise/maths" onClick={() => setIsOpen(false)} className="block py-1.5 text-xs text-slate-300 hover:text-primary-500">Maths</Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>

          {/* Logout */}
          <div className="p-4 border-t border-dark-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-start px-4 py-3 text-slate-200 hover:bg-dark-800 hover:text-primary-500 transition-colors font-medium tracking-wide cursor-pointer uppercase text-sm"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = ({ setIsOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (user?.role !== 'student') return; // Only implement for student right now
      try {
        setIsSearching(true);
        const { studentService } = await import('../services/api');
        const res = await studentService.searchTests(query);
        setResults(res.data?.tests || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, user]);

  return (
    <header className="bg-dark-900/90 backdrop-blur-md border-b border-dark-800 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center">
        <button 
          onClick={() => setIsOpen((prev) => !prev)}
          className="mr-6 text-slate-200 hover:text-white transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link to="/" className="flex items-center space-x-2 mr-6">
          <BookOpen className="h-6 w-6 text-primary-500" />
          <span className="text-xl font-black uppercase text-white tracking-tight hidden sm:block">
            Study<span className="text-primary-500">Spark</span>
          </span>
        </Link>
        
        {/* Search */}
        <div className="relative hidden sm:block w-64 md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 ${isSearching ? 'text-primary-500 animate-pulse' : 'text-slate-300'}`} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // delay so clicks register
            className="block w-full pl-10 pr-3 py-2 border border-dark-700 bg-dark-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all sm:text-sm font-medium tracking-wide"
            placeholder="Search mock tests, chapters..."
          />
          
          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-12 left-0 w-full bg-dark-800 border border-dark-700 shadow-2xl z-50 overflow-hidden">
              {results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-dark-700/50">
                  <div className="px-4 py-2 bg-dark-900 border-b border-dark-700 text-xs font-bold uppercase tracking-widest text-primary-500">
                    Test Results ({results.length})
                  </div>
                  {results.map(test => (
                    <button
                      key={test._id}
                      onClick={() => {
                        setShowDropdown(false);
                        setQuery('');
                        // If it's a test, we could navigate to a preview or dashboard
                        // Actually just navigate to dashboard and let them find it, or we can go to /tests
                        if (test.testType === 'mock') {
                           navigate(`/dashboard/tests/mock/${test.category || 'agriculture'}`);
                        } else {
                           navigate(`/dashboard/tests/chapter-wise/${test.subject || 'physics'}`);
                        }
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-dark-700 transition-colors group flex items-start"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-primary-500 mr-3 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-white leading-tight">{test.title}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
                          {test.subject || test.category} • {test.duration}m
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-400 font-medium">
                  No tests found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-200 hover:text-white transition-colors border border-transparent hover:border-dark-700 bg-dark-800">
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary-500 ring-2 ring-dark-800"></span>
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

import StudentOverview from './student/StudentOverview';
import StudentFlashcards from './student/StudentFlashcards';
import StudentBookmarks from './student/StudentBookmarks';
import StudentTestList from './student/StudentTestList';

import TestTakingInterface from './student/TestTakingInterface';
import StudentResults from './student/StudentResults';
import StudentResources from './student/StudentResources';
import Plan30Days from './student/Plan30Days';
import Plan45Days from './student/Plan45Days';

import InstructorOverview from './instructor/InstructorOverview';
import InstructorEditTest from './instructor/InstructorEditTest';
import InstructorReports from './instructor/InstructorReports';
import InstructorResources from './instructor/InstructorResources';

import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';

const Materials = () => <div className="text-slate-900 dark:text-white h-96 flex items-center justify-center bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">My Materials Implementation</div>;
const UploadArea = () => <div className="text-slate-900 dark:text-white h-96 flex items-center justify-center bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">File Upload Interface</div>;
const SettingsArea = () => <div className="text-slate-900 dark:text-white h-96 flex items-center justify-center bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">User Settings</div>;

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const { user } = useAuth();

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let OverviewComponent;
  let ResourcesComponent;
  
  if (user?.role === 'instructor' || user?.role === 'admin') {
    OverviewComponent = user?.role === 'admin' ? AdminOverview : InstructorOverview;
    ResourcesComponent = InstructorResources;
  } else {
    OverviewComponent = StudentOverview;
    ResourcesComponent = StudentResources;
  }

  return (
    <div className="min-h-screen bg-dark-900 flex text-slate-300 font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'}`}>
        <Header setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<OverviewComponent />} />
              
              {/* Student Only Routes */}
              {user?.role === 'student' && (
                <>
                  <Route path="/tests/:testType/:subCategory" element={<StudentTestList />} />
                  <Route path="/flashcards" element={<StudentFlashcards />} />
                  <Route path="/bookmarks" element={<StudentBookmarks />} />
                  <Route path="/test/:attemptId" element={<TestTakingInterface />} />
                  <Route path="/results/:attemptId" element={<StudentResults />} />
                </>
              )}

              {/* Instructor/Admin Only Routes */}
              {(user?.role === 'instructor' || user?.role === 'admin') && (
                <>
                  <Route path="/edit-test/:testId" element={<InstructorEditTest />} />
                  <Route path="/reports" element={<InstructorReports />} />
                  <Route path="/upload" element={<UploadArea />} />
                </>
              )}

              {/* Admin Only Routes */}
              {user?.role === 'admin' && (
                <Route path="/users" element={<AdminUsers />} />
              )}

              {/* Shared Routes */}
              <Route path="/materials" element={<ResourcesComponent />} />
              <Route path="/materials/:streamId" element={<ResourcesComponent />} />
              <Route path="/plan-30" element={<Plan30Days />} />
              <Route path="/plan-45" element={<Plan45Days />} />
              <Route path="/settings" element={<SettingsArea />} />
              
              {/* Catch-all route to redirect unauthorized access to overview */}
              <Route path="*" element={<OverviewComponent />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
