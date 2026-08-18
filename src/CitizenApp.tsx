import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIssues } from './services/issues';
import { CivicIssue, FilterOptions } from './types';
import { MapScreen } from './components/MapScreen';
import { BottomNav, TabType } from './components/BottomNav';
import { IssueDetailModal } from './components/IssueDetailModal';
import { FilterModal } from './components/FilterModal';
import { HomeScreen } from './components/HomeScreen';
import { ReportScreen } from './components/ReportScreen';
import { CommunityScreen } from './components/CommunityScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AiDiagnosticsModal } from './components/AiDiagnosticsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Smartphone, Monitor, ShieldCheck, Sparkles, MapPin, Cpu, LayoutDashboard } from 'lucide-react';

export default function CitizenApp() {
  const navigate = useNavigate();
    const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>('issue-1');
  const [detailIssue, setDetailIssue] = useState<CivicIssue | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isAiDiagOpen, setIsAiDiagOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'mobile-frame' | 'responsive'>('mobile-frame');
  useEffect(() => {
    getIssues().then((data) => {
      if (data) {
        // Map Supabase flat fields to CivicIssue shape
        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          severity: item.severity,
          status: item.status,
          description: item.description,
          location: {
            address: item.address,
            neighborhood: item.neighborhood,
            lat: item.latitude,
            lng: item.longitude,
          },
          reportedAt: item.reported_at
            ? new Date(item.reported_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : 'Recently',
          reportedBy: { name: 'Citizen', avatar: '', badge: '' },
          imageUrl: item.image_url || '',
          resolvedImageUrl: item.resolved_image_url || '',
          upvotes: item.upvotes || 0,
          hasUpvoted: false,
          assignedDepartment: item.assigned_department_id || '',
          estimatedFixTime: item.estimated_fix_time || '',
          aiAnalysis: item.issue_ai_analysis?.[0] ? {
            detectedHazard: item.issue_ai_analysis[0].detected_hazard,
            confidence: item.issue_ai_analysis[0].confidence,
            recommendedPriority: item.issue_ai_analysis[0].recommended_priority,
            estimatedRepairCost: item.issue_ai_analysis[0].estimated_repair_cost,
          } : undefined,
          timeline: (item.issue_timeline || []).map((t: any) => ({
            id: t.id,
            status: t.status,
            title: t.title,
            description: t.description,
            timestamp: t.timestamp
              ? new Date(t.timestamp).toLocaleDateString('en-IN')
              : '',
            actor: t.actor,
            actorRole: t.actor_role,
          })),
          comments: (item.issue_comments || []).map((c: any) => ({
            id: c.id,
            author: c.author,
            avatar: c.avatar || '',
            content: c.content,
            timestamp: new Date(c.created_at).toLocaleDateString('en-IN'),
            isOfficial: c.is_official,
          })),
        }));
        setIssues(mapped);
      }
    }).catch(console.error)
      .finally(() => setIssuesLoading(false));
  }, []);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    category: 'all',
    severity: 'all',
    status: 'all',
    sortBy: 'newest',
  });

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          issue.title.toLowerCase().includes(q) ||
          issue.location.address.toLowerCase().includes(q) ||
          issue.location.neighborhood.toLowerCase().includes(q) ||
          issue.category.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Severity filter
      if (filters.severity !== 'all' && issue.severity !== filters.severity) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && issue.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && issue.category !== filters.category) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'upvotes') {
        return b.upvotes - a.upvotes;
      }
      if (filters.sortBy === 'severity') {
        const severityRank = { critical: 3, moderate: 2, low: 1, resolved: 0 };
        return severityRank[b.severity] - severityRank[a.severity];
      }
      return 0;
    });
  }, [issues, searchQuery, filters]);

  // Upvoting
  const handleUpvote = (id: string) => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasUpvoted = !item.hasUpvoted;
          const upvotes = hasUpvoted ? item.upvotes + 1 : Math.max(0, item.upvotes - 1);
          return { ...item, hasUpvoted, upvotes };
        }
        return item;
      })
    );

    // Also update detail issue if currently open
    if (detailIssue && detailIssue.id === id) {
      setDetailIssue((prev) => {
        if (!prev) return null;
        const hasUpvoted = !prev.hasUpvoted;
        const upvotes = hasUpvoted ? prev.upvotes + 1 : Math.max(0, prev.upvotes - 1);
        return { ...prev, hasUpvoted, upvotes };
      });
    }
  };

  // Add Comment
  const handleAddComment = (issueId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: 'Alex Rivera (You)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      content: text,
      timestamp: 'Just now',
    };

    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          return { ...item, comments: [...item.comments, newComment] };
        }
        return item;
      })
    );

    if (detailIssue && detailIssue.id === issueId) {
      setDetailIssue((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      );
    }
  };

  // Add new citizen report
  const handleAddIssue = (newIssue: CivicIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    setActiveTab('map');
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] max-h-[100dvh] overflow-hidden relative bg-white md:bg-slate-950 items-center justify-start text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top App Bar / Desktop View Mode Switcher */}
      <header className="hidden md:flex w-full max-w-5xl px-4 py-2.5 items-center justify-between text-slate-300 text-xs z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-500/30">
            C
          </div>
          <div>
            <span className="font-extrabold text-white tracking-tight">CivicWatch</span>
            <span className="text-slate-400 hidden sm:inline ml-2">• Live Municipal Hazard Dispatch</span>
          </div>
        </div>

        {/* View Mode, AI Diagnostics & Admin Dashboard Switcher */}
        <div className="flex items-center gap-2">
          {/* Admin Dashboard Button */}
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-400/30 shadow-xs transition-all cursor-pointer"
            title="Open Admin Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </button>

          <button
            onClick={() => setIsAiDiagOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-400/30 shadow-xs transition-all cursor-pointer"
            title="Inspect AI Vision & Cloudinary Pipeline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Pipeline</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('mobile-frame')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                viewMode === 'mobile-frame'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Device</span>
            </button>
            <button
              onClick={() => setViewMode('responsive')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                viewMode === 'responsive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Width</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container / Mobile Device Frame */}
      <main
        className={`w-full flex-1 flex flex-col justify-start transition-all bg-white overflow-hidden relative ${
          viewMode === 'mobile-frame'
            ? 'md:max-w-[420px] md:my-3 md:rounded-[40px] md:shadow-[0_20px_60px_rgba(0,0,0,0.6)] md:border-[6px] md:border-slate-800 md:min-h-[780px] md:h-[85vh] md:max-h-[920px] h-full md:min-h-0'
            : 'md:max-w-4xl md:my-2 md:rounded-3xl md:shadow-2xl md:border md:border-slate-800 md:min-h-[820px] h-full md:h-[90vh] md:min-h-0'
        }`}
      >
        {/* Mobile Device Status Bar (when in mobile-frame mode on desktop) */}
        {viewMode === 'mobile-frame' && (
          <div className="hidden md:flex bg-white/80 backdrop-blur-md px-6 py-2 items-center justify-between text-slate-800 text-[11px] font-bold z-40 select-none border-b border-slate-100/50">
            <span>9:41</span>
            <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <div className="w-4 h-2.5 border border-slate-800 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-slate-800 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* Screen Content Based on Active Tab */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 relative">
          {activeTab === 'map' && (
            <MapScreen
              issues={filteredIssues}
              selectedIssueId={selectedIssueId}
              onSelectIssue={(id) => setSelectedIssueId(id)}
              onViewDetails={(issue) => setDetailIssue(issue)}
              onOpenFilter={() => setIsFilterOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onQuickReportAtLocation={(lat, lng) => {
                setActiveTab('report');
              }}
            />
          )}

          {activeTab === 'home' && (
            <HomeScreen
              issues={issues}
              onSelectIssue={(id) => {
                setSelectedIssueId(id);
                setActiveTab('map');
              }}
              onViewDetails={(issue) => setDetailIssue(issue)}
              onNavigateToMap={() => setActiveTab('map')}
              onNavigateToReport={() => setActiveTab('report')}
              onNavigateToProfile={() => setActiveTab('profile')}
              onUpvote={handleUpvote}
            />
          )}

          {activeTab === 'report' && (
            <ReportScreen
              onAddIssue={handleAddIssue}
              onCancel={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'community' && (
            <CommunityScreen />
          )}

          {activeTab === 'profile' && (
            <ErrorBoundary fallbackTitle="Profile Screen Error">
              <ProfileScreen
                issues={issues}
                onViewDetails={(issue) => setDetailIssue(issue)}
              />
            </ErrorBoundary>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          reportCount={issues.length}
        />

        {/* Detail Modal */}
        {detailIssue && (
          <IssueDetailModal
            issue={detailIssue}
            onClose={() => setDetailIssue(null)}
            onUpvote={handleUpvote}
            onAddComment={handleAddComment}
            onViewOnMap={(iss) => {
              setSelectedIssueId(iss.id);
              setActiveTab('map');
            }}
          />
        )}

        {/* Filter Drawer / Modal */}
        <FilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onApplyFilters={setFilters}
          totalResultsCount={filteredIssues.length}
        />

        {/* AI Multimodal Pipeline Diagnostics Modal */}
        <AiDiagnosticsModal
          isOpen={isAiDiagOpen}
          onClose={() => setIsAiDiagOpen(false)}
          onApplyToReport={(pipelineData) => {
            setActiveTab('report');
          }}
        />
      </main>
    </div>
  );
}
