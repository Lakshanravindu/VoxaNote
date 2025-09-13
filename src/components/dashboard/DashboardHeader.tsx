import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

interface NavigationItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

interface DashboardHeaderProps {
  navigation: NavigationItem[];
}

export function DashboardHeader({ navigation }: DashboardHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Vt</span>
            </div>
            <span className="text-xl font-semibold">
              <span className="text-white">Verto</span><span className="text-yellow-400">Note</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  item.active
                    ? 'text-blue-400 font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              🚪 Logout
            </button>
          </nav>

          {/* Mobile menu button - for future implementation */}
          <button className="md:hidden text-gray-300">
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
