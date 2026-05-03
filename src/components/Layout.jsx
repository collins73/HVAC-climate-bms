import { Link, useLocation, Outlet } from 'react-router-dom';
import { Building2, LayoutDashboard, Layers, AlertTriangle, Activity, ChevronRight, Upload, FolderOpen, Cpu, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/buildings', label: 'Buildings', icon: Building2 },
  { path: '/zones', label: 'Zones', icon: Layers },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { path: '/import', label: 'Blueprint Import', icon: Upload },
  { path: '/blueprints', label: 'Blueprint Library', icon: FolderOpen },
  { path: '/leads', label: 'Pipeline', icon: Users },
  { path: '/ai-design', label: 'AI Design', icon: Cpu },
];

export default function Layout() {
  const location = useLocation();

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-primary tracking-tight uppercase">EMS AI Technologies</div>
              <div className="text-xs text-muted-foreground font-medium">Omni Climate Flow</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive(path)
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {isActive(path) && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground text-center">v2.0 · Omni Climate Flow</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-sidebar border-b border-sidebar-border flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-primary leading-none">EMS AI Technologies</div>
              <div className="text-xs text-muted-foreground leading-none mt-0.5">Omni Climate Flow</div>
            </div>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
            Live
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border flex items-center z-50 safe-area-bottom">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors",
                isActive(path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive(path) && "drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]")} />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}