import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { X, Check, Bell, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDrawer: React.FC = () => {
  const {
    isOpen,
    closeNotifications,
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={closeNotifications}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Notifications panel"
          className="w-screen max-w-md bg-white dark:bg-night-800 shadow-2xl border-l border-sage-200 dark:border-night-700 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-sage-100 dark:border-night-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-forest-700 dark:text-forest-400 hover:underline flex items-center gap-1 font-medium"
                title="Mark all as read"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
              <button
                onClick={closeNotifications}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-sage-100 dark:hover:bg-night-700 transition-colors ml-2"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-sage-100 dark:divide-night-700">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map(notif => {
                const getIcon = () => {
                  switch (notif.type) {
                    case 'alert':
                      return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
                    case 'success':
                      return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
                    default:
                      return <Info className="w-4 h-4 text-forest-600 dark:text-forest-400" />;
                  }
                };

                return (
                  <div
                    key={notif.id}
                    className={`p-4 transition-colors relative hover:bg-sage-50/70 dark:hover:bg-night-750 ${
                      !notif.read ? 'bg-forest-50/30 dark:bg-forest-950/20' : ''
                    }`}
                  >
                    {!notif.read && (
                      <span className="absolute left-2 top-5 w-2 h-2 rounded-full bg-forest-600 dark:bg-forest-400" />
                    )}
                    <div className="pl-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {getIcon()}
                          <span>{notif.title}</span>
                        </div>
                        <button
                          onClick={() => clearNotification(notif.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Dismiss notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{notif.timestamp}</span>
                        {notif.link && (
                          <Link
                            to={notif.link}
                            onClick={() => {
                              markAsRead(notif.id);
                              closeNotifications();
                            }}
                            className="inline-flex items-center gap-1 text-forest-700 dark:text-forest-400 font-semibold hover:underline"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-sage-50/50 dark:bg-night-850 border-t border-sage-100 dark:border-night-700 text-center text-[11px] text-slate-400">
            Real-time simulated incident dispatcher stream
          </div>
        </aside>
      </div>
    </div>
  );
};
