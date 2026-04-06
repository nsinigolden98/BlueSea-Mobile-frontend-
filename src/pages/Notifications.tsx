import { useState, useEffect, useCallback } from 'react';
import { Sidebar, Header, Loader } from '@/components/ui-custom';
import { getRequest, postRequest, deleteRequest, ENDPOINTS } from '@/types';
import { Bell, Check, Trash2, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [count, setCount] = useState(0);
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  const fetchNotifications = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        showLoader();
      } else {
        setLoadingMore(true);
      }
      
      const currentPage = reset ? 1 : page;
      const isReadFilter = filter === 'unread' ? 'false' : undefined;
      const url = isReadFilter 
        ? `${ENDPOINTS.notifications}?page=${currentPage}&page_size=20&is_read=${isReadFilter}`
        : `${ENDPOINTS.notifications}?page=${currentPage}&page_size=20`;
      
      const response = await getRequest(url);
      
      if (response) {
        if (reset) {
          setNotifications(response.results || []);
        } else {
          setNotifications(prev => [...prev, ...(response.results || [])]);
        }
        setCount(response.count || 0);
        setHasMore(response.next !== null);
        if (reset) setPage(2);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      if (reset) hideLoader();
    }
  };

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      setPage(prev => prev + 1);
      fetchNotifications();
    }
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    setPage(1);
    fetchNotifications(true);
  }, [filter]);

  const markAsRead = async (notificationId: number) => {
    try {
      await postRequest(ENDPOINTS.notification_read(notificationId.toString()), {});
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await postRequest(ENDPOINTS.notification_mark_all_read, {});
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      console.log('Deleting notification:', notificationId);
      const result = await deleteRequest(ENDPOINTS.notification_delete(notificationId.toString()));
      console.log('Delete result:', result);
      if (result && result.error) {
        console.error('Failed to delete notification:', result.error);
        return;
      }
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment_success':
        return 'text-green-500';
      case 'payment_failed':
        return 'text-red-500';
      case 'payment':
        return 'text-blue-500';
      case 'wallet':
        return 'text-purple-500';
      case 'group':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Notifications"
          subtitle={`${count} total, ${unreadCount} unread`}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    filter === 'all'
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    filter === 'unread'
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  Unread
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-sky-500 hover:text-sky-600 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 rounded-2xl border transition-colors',
                      notification.is_read
                        ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                        : 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1" onClick={() => markAsRead(notification.id)}>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800 dark:text-white">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-sky-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {formatDate(notification.created_at)}
                          </span>
                          <span className={cn('text-xs', getTypeColor(notification.notification_type))}>
                            {notification.notification_type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-sky-500 hover:text-sky-600"
                    >
                      {loadingMore ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      Load more
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <LoaderComponent />
    </div>
  );
}
