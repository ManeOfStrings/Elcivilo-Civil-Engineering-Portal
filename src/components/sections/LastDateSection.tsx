import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { Badge } from '../common/Badge';

export const NotificationsSection: React.FC = () => {
  const { notifications } = usePortal();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-tick every minute for countdowns
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    'All',
    'Examination',
    'Assignment',
    'Registration',
    'Supply Exam',
    'Academic Notice',
  ];

  const filteredNotifs = useMemo(() => {
    return notifications
      .filter((n) => {
        const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [notifications, selectedCategory, searchQuery]);

  const calculateCountdown = (dueDateStr: string) => {
    const target = new Date(dueDateStr).getTime();
    const diff = target - now;

    if (isNaN(target)) return { label: 'TBA', urgent: false, isPast: false };

    if (diff < 0) {
      return { label: 'Deadline Passed', urgent: false, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0) {
      return { label: `Due in ${hours}h`, urgent: true, isPast: false };
    }
    if (days === 1) {
      return { label: 'Due tomorrow', urgent: true, isPast: false };
    }
    if (days <= 5) {
      return { label: `${days} days left`, urgent: true, isPast: false };
    }
    return { label: `${days} days left`, urgent: false, isPast: false };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blueprint-900 via-blueprint-800 to-steel p-6 sm:p-8 text-white shadow-md border border-blueprint-700">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safety/20 border border-safety/30 text-safety text-xs font-mono font-semibold tracking-wider uppercase">
            <Bell className="w-3.5 h-3.5" /> Notifications & Circulars
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-concrete-200 leading-relaxed">
            Official department notifications, upcoming project and coursework deadlines, examination timetables, supplementary registration alerts, and university circulars.
          </p>
        </div>

        {/* Background Architectural Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 shadow-xs">
        {/* Category Pills */}
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

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-concrete-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-950 text-concrete-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blueprint-500 font-sans"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900">
            <Bell className="w-10 h-10 mx-auto text-concrete-400 mb-2 stroke-[1.5]" />
            <h3 className="font-heading text-base font-bold text-concrete-800 dark:text-concrete-200">
              No notifications found
            </h3>
            <p className="text-xs text-concrete-500 mt-1">
              There are currently no circulars or deadlines matching your filter.
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => {
            const countdown = calculateCountdown(item.dueDate);

            return (
              <div
                key={item.id}
                className={`group relative p-5 rounded-xl border transition-all duration-200 bg-white dark:bg-concrete-900 shadow-xs hover:border-blueprint-500 ${
                  item.isUrgent
                    ? 'border-l-4 border-l-safety border-concrete-300 dark:border-concrete-800'
                    : 'border-concrete-300 dark:border-concrete-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          item.category === 'Supply Exam'
                            ? 'warning'
                            : item.category === 'Examination'
                            ? 'blueprint'
                            : 'concrete'
                        }
                        size="sm"
                      >
                        {item.category}
                      </Badge>

                      {/* Countdown Badge */}
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                          countdown.isPast
                            ? 'bg-concrete-100 dark:bg-concrete-800 text-concrete-500'
                            : countdown.urgent
                            ? 'bg-safety/20 text-concrete-950 dark:text-safety border border-safety/40'
                            : 'bg-blueprint-50 dark:bg-blueprint-950 text-blueprint-700 dark:text-blueprint-300 border border-blueprint-200 dark:border-blueprint-900'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{countdown.label}</span>
                      </span>

                      {item.isUrgent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-safety">
                          <AlertTriangle className="w-3 h-3" /> Urgent
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-base sm:text-lg font-bold text-concrete-900 dark:text-white group-hover:text-blueprint-600 dark:group-hover:text-blueprint-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-concrete-600 dark:text-concrete-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Target date */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-concrete-200 dark:border-concrete-800 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono text-concrete-400 uppercase block font-semibold">
                        Deadline / Date
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-concrete-900 dark:text-white">
                        {new Date(item.dueDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Aliased export for backwards compatibility
export const LastDateSection = NotificationsSection;
