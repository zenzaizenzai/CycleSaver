import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { User, AppView, BikeReport } from './types';
import { Scanner } from './components/Scanner';
import { Camera, MapPin, User as UserIcon, LogOut, History, Bike, Trophy, ChevronRight } from 'lucide-react';

// --- MOCK DATA & COMPONENTS ---

// Mock Login Component
const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin({
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0] || '市民ユーザー',
        email: email,
        region: '東京都新宿区',
        points: 120
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
                <Bike className="w-8 h-8 text-brand-600" />
            </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">CycleGuard</h1>
        <p className="text-center text-slate-500 mb-8">放置自転車監視・防犯プラットフォーム</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">パスワード</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-brand-200 transition-all flex justify-center items-center"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-400">
             プロトタイプ版 v0.1.0
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC<{ user: User; reports: BikeReport[]; onStartScan: () => void; onLogout: () => void }> = ({ user, reports, onStartScan, onLogout }) => {
    
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Bike className="w-6 h-6 text-brand-600" />
                <span className="font-bold text-lg text-slate-800">CycleGuard</span>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.region}</span>
                </div>
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-200">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-brand-100 text-sm font-medium mb-1">現在の獲得ポイント</p>
                    <div className="text-4xl font-bold flex items-baseline gap-1">
                        {user.points} <span className="text-lg font-normal opacity-80">pts</span>
                    </div>
                </div>
                <Trophy className="w-10 h-10 text-brand-200 opacity-50" />
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex justify-between items-center backdrop-blur-sm">
                <span className="text-sm font-medium">次のランクまで</span>
                <span className="text-sm font-bold">80 pts</span>
            </div>
        </div>

        {/* Action Button */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">活動を開始する</h2>
            <p className="text-sm text-slate-500 mb-6">放置自転車を見つけたら、番号をスキャンしてください。</p>
            <button 
                onClick={onStartScan}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
                <Camera className="w-6 h-6" />
                スキャンを開始
            </button>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <History className="w-4 h-4" /> 最近の活動
                </h3>
            </div>
            
            {reports.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400 text-sm">まだ活動履歴がありません</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-sm">{report.bikeNumber}</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">送信済み</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <MapPin className="w-3 h-3" />
                                    {new Date(report.timestamp).toLocaleDateString()} {new Date(report.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                            <div className="text-brand-600 font-bold text-sm">+10 pts</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
      
      {/* Logout Footer */}
      <div className="text-center py-6">
        <button onClick={onLogout} className="text-slate-400 text-sm flex items-center justify-center gap-2 mx-auto hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> ログアウト
        </button>
      </div>
    </div>
  );
};


// Main App Container
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [reports, setReports] = useState<BikeReport[]>([]);

  // Load user from local storage (simulation)
  useEffect(() => {
    const savedUser = localStorage.getItem('cycleguard_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView(AppView.DASHBOARD);
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('cycleguard_user', JSON.stringify(newUser));
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cycleguard_user');
    setCurrentView(AppView.LOGIN);
  };

  const handleScanSubmit = (report: BikeReport) => {
    // 1. Add to local state
    setReports(prev => [report, ...prev]);
    
    // 2. Update points (simulation)
    if (user) {
        const updatedUser = { ...user, points: user.points + 10 };
        setUser(updatedUser);
        localStorage.setItem('cycleguard_user', JSON.stringify(updatedUser));
    }

    // 3. Return to dashboard with success feedback
    setCurrentView(AppView.DASHBOARD);
    // In a real app, we'd show a toast notification here
    alert(`送信完了！\n登録番号: ${report.bikeNumber}\n10ポイント獲得しました。`);
  };

  if (!user || currentView === AppView.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      {currentView === AppView.DASHBOARD && (
        <Dashboard 
            user={user} 
            reports={reports} 
            onStartScan={() => setCurrentView(AppView.SCANNER)} 
            onLogout={handleLogout}
        />
      )}

      {currentView === AppView.SCANNER && (
        <Scanner 
            userId={user.id}
            defaultRegion={user.region}
            onClose={() => setCurrentView(AppView.DASHBOARD)}
            onSubmit={handleScanSubmit}
        />
      )}
    </>
  );
};

export default App;