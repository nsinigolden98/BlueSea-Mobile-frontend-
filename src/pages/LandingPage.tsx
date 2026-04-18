import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  ArrowRight, 
  Smartphone, 
  Wifi, 
  Users, 
  Lightbulb, 
  RefreshCw, 
  ShoppingCart, 
  TrendingUp, 
  Zap, 
  Gift,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  MessageCircle,
  type LucideProps
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: RefreshCw,
    title: 'Airtime Buyback',
    description: 'Return unused airtime for platform credit — flexible and simple.',
  },
  {
    icon: ShoppingCart,
    title: 'Loyalty Marketplace',
    description: 'Earn points for every transaction and redeem rewards.',
  },
  {
    icon: Zap,
    title: 'Smart Auto Top-Up',
    description: 'Schedule daily or weekly data plans with full control.',
  },
  {
    icon: Users,
    title: 'Group Payment',
    description: 'Manage shared payments for families, teams, and communities.',
  },
  {
    icon: TrendingUp,
    title: 'Spend Analysis',
    description: 'Track spending with privacy-compliant insights.',
  },
  {
    icon: Gift,
    title: 'BluePoints Rewards',
    description: 'Earn points on every transaction and unlock exclusive benefits.',
  },
];

const stats = [
  { value: '4.8', label: 'Users Rating' },
  { value: '50k+', label: 'Transactions' },
  { value: '99%', label: 'Success Rate' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800">
        <Logo />
        <Button 
          variant="outline" 
          className="rounded-full px-6 font-medium hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all"
          onClick={() => navigate('/login')}
        >
          Sign in
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="px-4 md:px-8 lg:px-12 py-12 md:py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-sky-600 dark:text-sky-400">Trusted by 50,000+ users</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-800 dark:text-white leading-tight">
                Save More. Earn More.<br />
                <span className="text-sky-500">Take Control</span> of Your Airtime & Data.
              </h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Enjoy AI-powered recommendations, instant refunds, group payments, and seamless offline access — all in one smart app.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="rounded-full px-6 md:px-8 bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-6 md:px-8 hover:bg-slate-50 transition-all"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Watch Tutorial
                </Button>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-[260px] h-[520px] md:w-[280px] md:h-[560px] bg-slate-900 rounded-[36px] md:rounded-[40px] p-3 shadow-2xl shadow-slate-900/30">
                <div className="absolute top-5 md:top-6 left-1/2 -translate-x-1/2 w-16 md:w-20 h-5 md:h-6 bg-slate-800 rounded-full" />
                <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[28px] md:rounded-[32px] overflow-hidden">
                  {/* Mock Dashboard Content */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                      <span className="text-sm font-semibold text-slate-700">Dashboard</span>
                      <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 rounded-xl p-4 text-white shadow-lg shadow-sky-500/25">
                      <p className="text-xs opacity-80 mb-1">Available Balance</p>
                      <p className="text-2xl md:text-3xl font-bold">₦5,000.00</p>
                      <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 bg-white/20 rounded text-xs">Deposit</span>
                        <span className="px-2 py-1 bg-white/20 rounded text-xs">Withdraw</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[Smartphone, Wifi, Users, Lightbulb].map((Icon, i) => (
                        <div key={i} className="bg-gradient-to-br from-sky-400 to-sky-600 rounded-lg p-2 flex flex-col items-center gap-1">
                          <Icon className="w-4 h-4 text-white" />
                          <span className="text-[8px] text-white font-medium">Action</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500">Recent Transactions</p>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="w-6 h-6 bg-sky-100 rounded-full" />
                          <span className="text-xs text-slate-600">Transaction {i}</span>
                          <span className="text-xs font-medium text-slate-700">₦{i * 100}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-sky-200/50 dark:bg-sky-900/20 rounded-full blur-3xl" />
              <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-sky-300/30 dark:bg-sky-800/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Trusted by People Everywhere
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 md:mb-12">
            Join thousands of users who buy and manage VTU daily.
          </p>
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-sky-500">{stat.value}</p>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 md:mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-sm font-medium rounded-full mb-4">
              Features
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-3 md:mb-4">
              What BlueSea Mobile Offers
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to stay connected, empowered, and in control
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={cn(
                    'group p-5 md:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50',
                    'hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl',
                    'border border-transparent hover:border-slate-100 dark:hover:border-slate-700',
                    'transition-all duration-300 hover:-translate-y-1'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-900/30 dark:to-sky-800/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-4 md:px-8 lg:px-12 py-16 md:py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-sm font-medium rounded-full mb-4">
              About Us
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              About BlueSea
            </h2>
          </div>
          
          <p className="text-slate-600 dark:text-slate-400 mb-10 md:mb-12 leading-relaxed text-center max-w-3xl mx-auto">
            BlueSea Mobile is a smart, reliable, and free-to-use VTU platform designed to combine mobile and digital services effortlessly for everyone. We offer seamless access to data and airtime purchases, gift card vouchers, utility and educational bill payments, funding for built-in platforms, premium subscriptions, and network packages.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
            <div className="p-5 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
              <span className="text-sky-500 font-bold text-xl">01</span>
              <h3 className="font-semibold text-slate-800 dark:text-white mt-3 mb-2">Vision</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Our goal is to grow from a local VTU platform into a standard digital service hub.
              </p>
            </div>
            <div className="p-5 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
              <span className="text-sky-500 font-bold text-xl">02</span>
              <h3 className="font-semibold text-slate-800 dark:text-white mt-3 mb-2">Mission</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                BlueSea Mobile exists to solve everyday digital and financial challenges with smart, simple, and secure tools.
              </p>
            </div>
            <div className="p-5 md:p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
              <span className="text-sky-500 font-bold text-xl">03</span>
              <h3 className="font-semibold text-slate-800 dark:text-white mt-3 mb-2">Our Team</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                BlueSea Mobile is powered by a passionate team that combines technical expertise and strategic vision.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button className="rounded-full px-8 bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/25 transition-all hover:scale-105">
              Send Feedback
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-sky-100 mb-6 md:mb-8 max-w-lg mx-auto">
                Join thousands of users who trust BlueSea Mobile for their daily VTU needs.
              </p>
              <Button 
                size="lg"
                className="rounded-full px-8 bg-white text-sky-500 hover:bg-sky-50 transition-all hover:scale-105"
                onClick={() => navigate('/signup')}
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
                  <span className="text-sm font-bold">BS</span>
                </div>
                <h3 className="font-bold text-xl">BlueSea Mobile</h3>
              </div>
              <p className="text-slate-400 text-sm">The Trusted Way to Stay Connected</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: 'WhatsApp', icon: MessageCircle, link: '#' },
                { name: 'Facebook', icon: Facebook, link: '#' },
                { name: 'Instagram', icon: Instagram, link: '#' },
                { 
                  name: 'TikTok', 
                  link: 'https://www.tiktok.com/@blueseamobile?_r=1&_t=ZS-95djVbThdkz',
                  icon: (props: LucideProps) => (
                    <svg 
                      {...props} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  )
                },
                { name: 'X', icon: Twitter, link: 'https://x.com/BlueseaMobile' },
                { name: 'YouTube', icon: Youtube, link: 'https://youtube.com/@blueseamobile?si=NU0mzFOxSbpJRU8d' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={social.name}
                    href={social.link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-sky-500 flex items-center justify-center transition-all hover:scale-110"
                    title={social.name}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Legal</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-sm text-slate-500 text-center">
              © 2025 BlueSea Mobile. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
