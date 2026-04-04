import { useState } from 'react';
import { Sidebar, Header } from '@/components/ui-custom';
import { useNavigate } from 'react-router-dom';
import { Tv } from 'lucide-react';

const tvServices = [
  {
    id: 'dstv',
    name: 'DSTV',
    description: 'Subscribe to DSTV packages',
    color: 'bg-red-500',
  },
  {
    id: 'gotv',
    name: 'GOTV',
    description: 'Subscribe to GOTV packages',
    color: 'bg-orange-500',
  },
  {
    id: 'startimes',
    name: 'Startimes',
    description: 'Subscribe to Startimes packages',
    color: 'bg-blue-500',
  },
  {
    id: 'showmax',
    name: 'ShowMax',
    description: 'Stream movies and shows',
    color: 'bg-purple-500',
  },
];

export function TVSubscription() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleServiceClick = (serviceId: string) => {
    navigate(`/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="TV Subscription"
          subtitle="Choose your TV service provider"
          showBackButton={true}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tvServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
                >
                  <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center`}>
                    <Tv className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {service.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
