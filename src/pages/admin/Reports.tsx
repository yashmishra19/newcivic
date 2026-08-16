import { useState } from 'react';
import {
  FileText, Download, Share2, Plus, Search, Cloud, HardDrive,
  File, FileSpreadsheet, Table2, X, ChevronRight,
} from 'lucide-react';
import { MOCK_REPORTS, REPORT_CATEGORIES } from '../../data/mockReports';

const FILE_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  pdf: { icon: FileText, color: 'text-red-600', bg: 'bg-red-50' },
  xlsx: { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  csv: { icon: Table2, color: 'text-blue-600', bg: 'bg-blue-50' },
  docx: { icon: File, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

const REPORT_TYPES = [
  { label: 'Incident Report', desc: 'Generate a comprehensive report of all incidents within a date range.' },
  { label: 'Department Performance', desc: 'Evaluate department KPIs, response times, and SLA compliance.' },
  { label: 'Citizen Activity', desc: 'Analyze citizen reporting patterns, engagement, and satisfaction.' },
  { label: 'Monthly Audit', desc: 'Full operational audit including financials, incidents, and workforce.' },
  { label: 'Custom Report', desc: 'Build a custom report with selected data sources and metrics.' },
];

export default function Reports() {
  const [activeCategory, setActiveCategory] = useState('All Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filteredReports = MOCK_REPORTS.filter((rpt) => {
    if (activeCategory !== 'All Reports' && rpt.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return rpt.name.toLowerCase().includes(q) || rpt.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-[1440px]">
      {/* Left Panel */}
      <div className="w-full lg:w-60 flex-shrink-0 space-y-5">
        {/* Categories */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3">
          <h3 className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 mb-2">
            Categories
          </h3>
          <div className="space-y-0.5">
            {REPORT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="w-4 h-4 text-blue-500" />
            <h3 className="text-[13px] font-semibold text-slate-800">Cloud Storage</h3>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div className="h-full w-[42%] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
          </div>
          <p className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">42%</span> used of 50 GB
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-5">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> Generate New Report
          </button>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-[15px]">Recent Documents</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">{filteredReports.length} documents found</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Generated</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((rpt) => {
                  const fileStyle = FILE_ICONS[rpt.fileType] || FILE_ICONS.pdf;
                  const FileIcon = fileStyle.icon;
                  return (
                    <tr key={rpt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg ${fileStyle.bg} flex items-center justify-center flex-shrink-0`}>
                            <FileIcon className={`w-4 h-4 ${fileStyle.color}`} />
                          </div>
                          <span className="text-[13px] font-medium text-slate-800 truncate max-w-[250px]">
                            {rpt.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg font-medium">
                          {rpt.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-600">{rpt.size}</td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-600">{rpt.generatedDate}</td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-600">{rpt.createdBy}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors" title="Share">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredReports.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-[13px]">
                <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No documents match your criteria.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-[16px]">Generate New Report</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">Select a report type to generate</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.label}
                  onClick={() => setShowModal(false)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {type.label}
                      </p>
                      <p className="text-[12px] text-slate-500 mt-0.5">{type.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
