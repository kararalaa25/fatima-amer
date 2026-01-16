import { PageTransition } from '@/components/PageTransition';
import { CaseManagementDashboard } from '@/components/case-management/CaseManagementDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CaseManagement() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen mesh-gradient-bg relative">
        {/* Header */}
        <header className="relative z-10 glass-nav sticky top-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-2xl glass-card hover:bg-primary/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-card">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Case Management
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Multi-image upload & assessment
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 relative z-10">
          <CaseManagementDashboard />
        </main>
      </div>
    </PageTransition>
  );
}
