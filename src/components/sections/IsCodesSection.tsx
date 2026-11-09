import React, { useState, useMemo } from 'react';
import {
  BookMarked,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calculator,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Scale,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { ReferenceCode, ReferenceCodeCategory } from '../../types';
import { BlueprintCard } from '../common/BlueprintCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const IsCodesSection: React.FC = () => {
  const { referenceCodes, deleteReferenceCode, downloadDocument, openPreview } = usePortal();
  const { isAdmin } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnitConverter, setShowUnitConverter] = useState(false);

  // Interactive Quick Unit Converter State
  const [convertType, setConvertType] = useState<'pressure' | 'force' | 'density'>('pressure');
  const [convertValue, setConvertValue] = useState<number>(100);

  const categories: (ReferenceCodeCategory | 'All')[] = [
    'All',
    'Structural',
    'Concrete',
    'Steel',
    'Geotechnical',
    'Tables & Charts',
    'General',
  ];

  const filteredCodes = useMemo(() => {
    return referenceCodes.filter((c) => {
      const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        c.codeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [referenceCodes, selectedCategory, searchQuery]);

  const handleDownloadCode = (code: ReferenceCode) => {
    downloadDocument({
      title: `${code.codeNumber} - ${code.title}`,
      fileName: `${code.codeNumber.replace(/[\s:/]+/g, '_')}.pdf`,
      fileUrl: code.fileUrl,
      category: 'notes',
      subjectCode: code.codeNumber,
    });
  };

  const handlePreviewCode = (code: ReferenceCode) => {
    openPreview({
      id: code.id,
      title: `${code.codeNumber}: ${code.title}`,
      fileName: `${code.codeNumber.replace(/[\s:/]+/g, '_')}.pdf`,
      fileUrl: code.fileUrl,
      fileType: 'pdf',
      fileSize: code.fileSize,
      category: 'notes',
      subjectId: 'codes',
      subjectCode: code.codeNumber,
      subjectName: 'IS Codes & Reference Tables',
      semester: 0,
      description: code.description,
      uploadedAt: new Date().toISOString(),
      downloadCount: 42,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blueprint-900 via-blueprint-800 to-steel p-6 sm:p-8 text-white shadow-md border border-blueprint-700">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safety/20 border border-safety/30 text-safety text-xs font-mono font-semibold tracking-wider uppercase">
            <BookMarked className="w-3.5 h-3.5" /> Module 8: Bureau of Indian Standards & Reference Tables
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            IS Codes, Steel Tables & Reference Charts
          </h1>
          <p className="text-sm sm:text-base text-concrete-200 leading-relaxed">
            Essential Indian Standard codes of practice (IS 456, IS 800, IS 1893, SP 16), structural steel section property handbooks, and geotechnical classification charts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 relative z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowUnitConverter(!showUnitConverter)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold"
          >
            <Scale className="w-4 h-4 mr-1.5 text-safety" />
            {showUnitConverter ? 'Hide Unit Cheat Sheet' : 'Civil Unit Conversion Tool'}
          </Button>
        </div>

        {/* Blueprint background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Civil Engineering Quick Unit Conversion Sheet */}
      {showUnitConverter && (
        <BlueprintCard
          title="Civil Engineering Unit Conversion Cheat Sheet"
          subtitle="Instant interactive conversions for stress, loads, pressure, and density"
          highlight
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-concrete-200 dark:border-concrete-800 pb-3">
              <button
                onClick={() => setConvertType('pressure')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  convertType === 'pressure'
                    ? 'bg-blueprint-700 text-white'
                    : 'text-concrete-600 dark:text-concrete-300 hover:bg-concrete-100'
                }`}
              >
                Stress & Pressure (MPa / kN/m²)
              </button>
              <button
                onClick={() => setConvertType('force')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  convertType === 'force'
                    ? 'bg-blueprint-700 text-white'
                    : 'text-concrete-600 dark:text-concrete-300 hover:bg-concrete-100'
                }`}
              >
                Force & Weight (kN / Tonne)
              </button>
              <button
                onClick={() => setConvertType('density')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  convertType === 'density'
                    ? 'bg-blueprint-700 text-white'
                    : 'text-concrete-600 dark:text-concrete-300 hover:bg-concrete-100'
                }`}
              >
                Unit Weight & Density (kN/m³ / kg/m³)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-concrete-50 dark:bg-concrete-950 border border-concrete-200 dark:border-concrete-800">
                <span className="text-[10px] font-mono text-concrete-500 uppercase block">1 N/mm² is equal to</span>
                <span className="font-mono text-base font-bold text-blueprint-700 dark:text-safety">1 MPa</span>
                <span className="text-[11px] text-concrete-600 dark:text-concrete-400 block mt-0.5">= 1,000 kN/m²</span>
              </div>
              <div className="p-3 rounded-lg bg-concrete-50 dark:bg-concrete-950 border border-concrete-200 dark:border-concrete-800">
                <span className="text-[10px] font-mono text-concrete-500 uppercase block">1 Metric Tonne Force</span>
                <span className="font-mono text-base font-bold text-blueprint-700 dark:text-safety">9.81 kN</span>
                <span className="text-[11px] text-concrete-600 dark:text-concrete-400 block mt-0.5">≈ 10 kN (Engineering estimate)</span>
              </div>
              <div className="p-3 rounded-lg bg-concrete-50 dark:bg-concrete-950 border border-concrete-200 dark:border-concrete-800">
                <span className="text-[10px] font-mono text-concrete-500 uppercase block">RCC Unit Weight (IS 456)</span>
                <span className="font-mono text-base font-bold text-blueprint-700 dark:text-safety">25.0 kN/m³</span>
                <span className="text-[11px] text-concrete-600 dark:text-concrete-400 block mt-0.5">Plain Concrete = 24.0 kN/m³</span>
              </div>
              <div className="p-3 rounded-lg bg-concrete-50 dark:bg-concrete-950 border border-concrete-200 dark:border-concrete-800">
                <span className="text-[10px] font-mono text-concrete-500 uppercase block">Structural Steel Unit Weight</span>
                <span className="font-mono text-base font-bold text-blueprint-700 dark:text-safety">78.5 kN/m³</span>
                <span className="text-[11px] text-concrete-600 dark:text-concrete-400 block mt-0.5">= 7,850 kg/m³</span>
              </div>
            </div>
          </div>
        </BlueprintCard>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blueprint-700 text-white shadow-xs'
                  : 'text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-concrete-400" />
          <input
            type="text"
            placeholder="Search code (e.g., 456, 800, Steel)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-950 text-concrete-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blueprint-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCodes.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900">
            <BookMarked className="w-10 h-10 mx-auto text-concrete-400 mb-2 stroke-[1.5]" />
            <h3 className="font-heading text-base font-bold text-concrete-800 dark:text-concrete-200">
              No standard codes found
            </h3>
            <p className="text-xs text-concrete-500 mt-1">
              Try adjusting your search query or selecting a different category filter.
            </p>
          </div>
        ) : (
          filteredCodes.map((code) => (
            <div
              key={code.id}
              className="group flex flex-col justify-between p-5 rounded-xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 hover:border-blueprint-500 transition-all shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blueprint-100 dark:bg-blueprint-900/60 text-blueprint-900 dark:text-blueprint-200 border border-blueprint-300 dark:border-blueprint-800">
                    {code.codeNumber}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-concrete-100 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-400">
                    {code.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading text-base font-bold text-concrete-900 dark:text-white group-hover:text-blueprint-600 dark:group-hover:text-blueprint-400 transition-colors">
                    {code.title}
                  </h3>
                  {code.year && (
                    <span className="text-[11px] font-mono text-concrete-500 block mt-0.5">
                      Edition / Year: {code.year}
                    </span>
                  )}
                </div>

                <p className="text-xs text-concrete-600 dark:text-concrete-300 line-clamp-3 leading-relaxed">
                  {code.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-concrete-100 dark:border-concrete-800 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-concrete-400">
                  {code.fileSize}
                </span>

                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button
                      onClick={() => deleteReferenceCode(code.id)}
                      className="p-1.5 rounded-lg text-concrete-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Standard (Admin)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handlePreviewCode(code)}
                    className="p-1.5 rounded-lg border border-concrete-300 dark:border-concrete-700 hover:bg-concrete-100 dark:hover:bg-concrete-800 text-concrete-700 dark:text-concrete-300 transition-colors"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownloadCode(code)}
                    className="flex items-center gap-1.5 text-xs py-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

