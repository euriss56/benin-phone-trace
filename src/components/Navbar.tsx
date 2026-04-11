import { Moon, Sun, Bell, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { profile, role } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-muted-foreground hidden md:block">
            Bienvenue, <span className="text-foreground font-semibold">{profile?.name || 'Utilisateur'}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={16} className="text-muted-foreground" /> : <Sun size={16} className="text-muted-foreground" />}
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 relative">
            <Bell size={16} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </Button>

          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-foreground leading-none">{profile?.name || 'Utilisateur'}</p>
              <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{role || 'user'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
