import React, { useState } from 'react';
import { X, MapPin, ThumbsUp, Clock, AlertTriangle, CheckCircle, Wrench, Shield, MessageSquare, Send, Share2, Check } from 'lucide-react';
import { CivicIssue } from '../types';
import { motion } from 'motion/react';

interface IssueDetailModalProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onUpvote: (id: string) => void;
  onAddComment: (issueId: string, text: string) => void;
  onViewOnMap?: (issue: CivicIssue) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onUpvote,
  onAddComment,
  onViewOnMap,
}) => {
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showResolvedImage, setShowResolvedImage] = useState(false);

  if (!issue) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(issue.id, commentText.trim());
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            {issue.severity === 'critical' ? (
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-full text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                Critical Hazard
              </span>
            ) : issue.status === 'resolved' ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                Resolved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-full text-xs">
                <Wrench className="w-3.5 h-3.5" />
                In Progress
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">#{issue.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Share report"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main Photo / Before-After Photo */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm aspect-video sm:aspect-16/10">
            <img
              src={showResolvedImage && issue.resolvedImageUrl ? issue.resolvedImageUrl : issue.imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            {issue.resolvedImageUrl && (
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md rounded-xl p-1 shadow-md flex items-center gap-1 text-xs font-semibold">
                <button
                  onClick={() => setShowResolvedImage(false)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    !showResolvedImage ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Before
                </button>
                <button
                  onClick={() => setShowResolvedImage(true)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    showResolvedImage ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  After (Repaired)
                </button>
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {issue.title}
            </h2>

            <div className="flex items-center gap-2 mt-2 text-slate-500 text-xs sm:text-sm">
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                Reported {issue.reportedAt}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">by {issue.reportedBy.name}</span>
            </div>

            <div className="flex items-start gap-1.5 mt-2.5 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{issue.location.address} ({issue.location.neighborhood})</span>
                <span
                  className={`ml-2 inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    issue.location.jurisdiction === 'Private'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {issue.location.jurisdiction === 'Private' ? '🏠 Private Property' : '🏛️ Public Municipal'}
                </span>
              </div>
            </div>
          </div>

          {/* Upvote & Action Bar */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onUpvote(issue.id)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                  issue.hasUpvoted
                    ? 'bg-[#1e40af] text-white shadow-blue-900/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${issue.hasUpvoted ? 'fill-white' : ''}`} />
                <span>{issue.upvotes} {issue.upvotes === 1 ? 'Upvote' : 'Upvotes'}</span>
              </button>
              <span className="text-xs text-[#757684] font-medium">Community priority boost</span>
            </div>

            {onViewOnMap && (
              <button
                onClick={() => {
                  onClose();
                  onViewOnMap(issue);
                }}
                className="text-xs font-bold text-[#1e40af] hover:underline px-2 py-1"
              >
                Show on Map
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#757684] mb-1.5">
              Issue Description
            </h4>
            <p className="text-sm text-[#0d1c2e] leading-relaxed bg-white p-3.5 rounded-xl border border-slate-100">
              {issue.description}
            </p>
          </div>

          {/* AI Hazard Analysis Card */}
          {issue.aiAnalysis && (
            <div className="bg-[#e6eeff]/70 p-4 rounded-2xl border border-[#d5e3fc]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#1e40af]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#00288e]">
                  AI Hazard & Risk Assessment
                </h4>
                <span className="ml-auto text-[11px] font-semibold bg-[#dde1ff] text-[#001453] px-2 py-0.5 rounded-full">
                  {issue.aiAnalysis.confidence}% confidence
                </span>
              </div>
              <p className="text-xs font-semibold text-[#0d1c2e]">
                {issue.aiAnalysis.detectedHazard}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#d5e3fc] text-xs">
                <div>
                  <span className="text-[#757684] block text-[11px]">Recommended Priority</span>
                  <span className="font-bold text-[#00288e]">{issue.aiAnalysis.recommendedPriority}</span>
                </div>
                {issue.aiAnalysis.estimatedRepairCost && (
                  <div>
                    <span className="text-[#757684] block text-[11px]">Est. Municipal Cost</span>
                    <span className="font-bold text-[#0d1c2e]">{issue.aiAnalysis.estimatedRepairCost}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Municipal Progress Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#757684] mb-3">
              Municipal Resolution Timeline
            </h4>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {issue.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${
                      event.actorRole === 'city_agent'
                        ? 'bg-[#1e40af] text-white'
                        : event.actorRole === 'system'
                        ? 'bg-[#00288e] text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    •
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0d1c2e]">{event.title}</span>
                      <span className="text-[11px] text-[#757684]">{event.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#444653] mt-1">{event.description}</p>
                    <span className="text-[10px] text-[#757684] font-medium block mt-1">
                      By {event.actor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#757684]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#757684]">
                Community Updates & Comments ({issue.comments.length})
              </h4>
            </div>

            <div className="space-y-3 mb-4">
              {issue.comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border text-xs ${
                    c.isOfficial
                      ? 'bg-[#e6eeff] border-[#d5e3fc] text-[#0d1c2e]'
                      : 'bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0d1c2e]">{c.author}</span>
                      {c.isOfficial && (
                        <span className="bg-[#1e40af] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-sm">
                          OFFICIAL
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#757684]">{c.timestamp}</span>
                  </div>
                  <p className="text-[#444653] leading-normal">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add an update or eyewitness comment..."
                className="flex-1 bg-slate-50 border border-slate-200 text-[#0d1c2e] placeholder-slate-400 text-xs rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-[#1e40af] focus:bg-white"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2.5 bg-[#1e40af] hover:bg-[#00288e] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
