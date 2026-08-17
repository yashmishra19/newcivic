import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  Award, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Check, 
  Building 
} from 'lucide-react';

interface Post {
  id: string;
  avatar: string;
  name: string;
  neighborhood: string;
  type: 'critical' | 'resolved' | 'discussion' | 'thanks' | 'official';
  time: string;
  photo?: string;
  caption: string;
  location?: string;
  upvotes: number;
  comments: number;
  hasUpvoted?: boolean;
  hasFollowed?: boolean;
}

export const CommunityScreen: React.FC = () => {
  const [feedFilter, setFeedFilter] = useState<'trending' | 'recent'>('trending');
  
  // Community Feed Mock Data
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'post-1',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      neighborhood: 'Mission District',
      type: 'critical',
      time: '15 mins ago',
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      caption: 'Severe pothole detected on 24th St. Already damaged two bike tires this morning. Watch out!',
      location: '24th St & Mission St',
      upvotes: 42,
      comments: 7,
      hasUpvoted: true
    },
    {
      id: 'post-2',
      name: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      neighborhood: 'Castro District',
      type: 'resolved',
      time: '2 hours ago',
      caption: 'The streetlight on Pine St is FIXED! 🎉 Thank you to the municipal team for the quick turnaround.',
      location: 'Pine St & 18th St',
      upvotes: 28,
      comments: 3
    },
    {
      id: 'post-3',
      name: 'Robert S.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      neighborhood: 'Metro Center',
      type: 'discussion',
      time: '4 hours ago',
      caption: 'Anyone else seeing water pressure drops or flooding on Market St? Might be a water main leak near the station.',
      location: 'Market St Transit Hub',
      upvotes: 15,
      comments: 11
    },
    {
      id: 'post-4',
      name: 'City of SF Public Works',
      avatar: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?auto=format&fit=crop&w=150&q=80',
      neighborhood: 'Official',
      type: 'official',
      time: '5 hours ago',
      caption: 'Crew dispatched to investigate the water main leak near Market St Transit Hub. ETA to site is 2 hours. Traffic diversion in place.',
      location: 'Market St Segment',
      upvotes: 56,
      comments: 4
    }
  ]);

  const handleUpvote = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          upvotes: post.hasUpvoted ? post.upvotes - 1 : post.upvotes + 1,
          hasUpvoted: !post.hasUpvoted
        };
      }
      return post;
    }));
  };

  const handleFollow = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          hasFollowed: !post.hasFollowed
        };
      }
      return post;
    }));
  };

  return (
    <div className="w-full bg-[#F8F9FA] min-h-full font-['Plus_Jakarta_Sans',sans-serif] pb-24">
      {/* SECTION 1 — TOP HEADER */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-slate-100 shadow-2xs">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">CivicPulse</h1>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Metro District 4 • 2.3k neighbors active</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setFeedFilter('trending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                feedFilter === 'trending'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setFeedFilter('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                feedFilter === 'recent'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* SECTION 2 — NEIGHBORHOOD STATS BAR */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          <div className="flex-shrink-0 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100/50">
            <span className="text-sm">🚨</span>
            <span className="text-[11px] font-bold text-slate-700">12 Active Issues</span>
          </div>
          <div className="flex-shrink-0 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100/50">
            <span className="text-sm">✅</span>
            <span className="text-[11px] font-bold text-slate-700">34 Resolved This Week</span>
          </div>
          <div className="flex-shrink-0 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100/50">
            <span className="text-sm">👥</span>
            <span className="text-[11px] font-bold text-slate-700">2.3k Neighbors</span>
          </div>
          <div className="flex-shrink-0 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100/50">
            <span className="text-sm">⭐</span>
            <span className="text-[11px] font-bold text-slate-700">89% Response Rate</span>
          </div>
        </div>

        {/* SECTION 3 — CIVIC CHALLENGES */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Weekly Challenge 🏆</span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Report 3 issues in your block</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Earn the prestigious Civic Hero Badge</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
              <span>Challenge Progress (1/3)</span>
              <span className="text-slate-400">4 days left</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: '33%' }}></div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — COMMUNITY FEED */}
        <div className="space-y-3">
          {posts.map((post) => {
            let badgeBg = 'bg-slate-100 text-slate-700';
            let badgeText = post.type.toUpperCase();
            
            if (post.type === 'critical') {
              badgeBg = 'bg-red-50 text-red-600 border border-red-100';
              badgeText = '🚨 CRITICAL ALERT';
            } else if (post.type === 'resolved') {
              badgeBg = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
              badgeText = '✅ RESOLVED';
            } else if (post.type === 'discussion') {
              badgeBg = 'bg-blue-50 text-blue-600 border border-blue-100';
              badgeText = '💬 DISCUSSION';
            } else if (post.type === 'official') {
              badgeBg = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
              badgeText = '🏛️ OFFICIAL REPLY';
            }

            return (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] overflow-hidden">
                {/* Author Info */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.avatar} 
                      alt={post.name} 
                      className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{post.name}</span>
                        {post.type === 'official' && (
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{post.neighborhood} • {post.time}</span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Media Image */}
                {post.photo && (
                  <div className="w-full aspect-video overflow-hidden bg-slate-100 border-y border-slate-100">
                    <img src={post.photo} alt="Post media" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Caption / Content */}
                <div className="px-4 pt-3 pb-2">
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{post.caption}</p>
                  
                  {post.location && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-2.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{post.location}</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100/50 flex justify-between items-center text-slate-400">
                  <button 
                    onClick={() => handleUpvote(post.id)}
                    className={`flex items-center gap-1.5 text-[11px] font-extrabold py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                      post.hasUpvoted ? 'text-blue-600 bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${post.hasUpvoted ? 'fill-blue-600 stroke-[2.2]' : ''}`} />
                    <span>{post.upvotes}</span>
                  </button>

                  <button className="flex items-center gap-1.5 text-[11px] font-extrabold py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.comments}</span>
                  </button>

                  <button 
                    onClick={() => handleFollow(post.id)}
                    className={`flex items-center gap-1.5 text-[11px] font-extrabold py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                      post.hasFollowed ? 'text-emerald-600 bg-emerald-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Bell className={`w-3.5 h-3.5 ${post.hasFollowed ? 'fill-emerald-600 stroke-[2.2]' : ''}`} />
                    <span>{post.hasFollowed ? 'Following' : 'Follow'}</span>
                  </button>

                  <button className="flex items-center gap-1.5 text-[11px] font-extrabold py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION 5 — LOCAL HEROES STRIP */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-3">Top Reporters This Month 🌟</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {[
              { name: 'Sarah K.', reports: 23, badge: '🏆', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' },
              { name: 'James L.', reports: 19, badge: '🥇', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
              { name: 'Zoe M.', reports: 14, badge: '🥈', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
              { name: 'David H.', reports: 11, badge: '🥉', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
            ].map((hero, idx) => (
              <div key={idx} className="flex-shrink-0 w-20 flex flex-col items-center text-center">
                <div className="relative">
                  <img src={hero.avatar} alt={hero.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/20" />
                  <span className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-xs w-5 h-5 flex items-center justify-center text-xs">
                    {hero.badge}
                  </span>
                </div>
                <span className="text-[10px] font-black text-slate-800 mt-2 truncate w-full">{hero.name}</span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">{hero.reports} reports</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6 — OFFICIAL UPDATES */}
        <div className="bg-white rounded-2xl p-4 border-l-4 border-blue-500 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-4 h-4 text-blue-500" />
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-slate-900">City of SF Public Works</span>
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">
                ✓
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Scheduled maintenance on Mission St this Friday 6AM-2PM. Expect lane closures and slow traffic.
          </p>
          <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center text-[10px] font-extrabold text-blue-600 mt-3 hover:underline">
            View Full Schedule →
          </a>
        </div>
      </div>
    </div>
  );
};
