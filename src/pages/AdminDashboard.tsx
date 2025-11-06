import { useState, useEffect } from 'react';
import {
  Bell,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  MessageSquare,
  Smartphone,
  Target,
  BarChart3,
  PaintBucket,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [conversionRate, setConversionRate] = useState('0.0');

  useEffect(() => {
    // Simulate real-time data
    setBookings(Math.floor(Math.random() * 50) + 10);
    setRevenue(Math.floor(Math.random() * 5000) + 1000);
    setConversionRate((Math.random() * 15 + 5).toFixed(1));
  }, []);

  const features = [
    {
      icon: Bell,
      title: 'Instant Notifications',
      description: 'Get notified instantly when someone books',
      emoji: '📧',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Deposits',
      description: 'See deposit payments land in real-time',
      emoji: '💰',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Calendar,
      title: 'Google Calendar Sync',
      description: 'Syncs with your Google Calendar automatically',
      emoji: '📅',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: MapPin,
      title: 'Multi-City Availability',
      description: 'Set different availability for different cities',
      emoji: '🗺️',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: Clock,
      title: 'Personal Time Blocking',
      description: 'Block out personal time with one click',
      emoji: '🚫',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: MessageSquare,
      title: 'Auto Reminders',
      description: 'Send automatic reminders to clients (reduce no-shows!)',
      emoji: '⏰',
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile Updates',
      description: 'Update availability from your phone anytime',
      emoji: '📱',
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: Target,
      title: 'Social Attribution',
      description: 'See EXACTLY which social posts bring in bookings',
      emoji: '🎯',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const analytics = [
    {
      title: 'Platform Performance',
      icon: BarChart3,
      items: [
        { label: 'Twitter', value: 5, unit: 'bookings' },
        { label: 'Reddit', value: 2, unit: 'bookings' },
        { label: 'TikTok', value: 8, unit: 'bookings' },
        { label: 'Direct', value: 12, unit: 'bookings' },
      ],
      emoji: '📈',
    },
    {
      title: 'A/B Testing',
      icon: PaintBucket,
      description: 'Test different website designs automatically',
      emoji: '🎨',
    },
    {
      title: 'Conversion Tracking',
      icon: Activity,
      description: 'Know your conversion rates per campaign',
      emoji: '💡',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-purple-600/20" />
        <div className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-rose-400 hover:text-rose-300 mb-6"
          >
            ← Back to Main Site
          </Link>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl">
            Your complete booking management and marketing intelligence platform
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                <p className="text-4xl font-bold mt-2">{bookings}</p>
              </div>
              <Bell className="w-12 h-12 text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Revenue (This Week)</p>
                <p className="text-4xl font-bold mt-2">${revenue}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Conversion Rate</p>
                <p className="text-4xl font-bold mt-2">{conversionRate}%</p>
              </div>
              <Activity className="w-12 h-12 text-purple-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">For YOU: Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-rose-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10"
                >
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} text-white mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl mb-2">{feature.emoji}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-300 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Marketing Intelligence Section */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">
            📊 Marketing Intelligence
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Platform Performance */}
            <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-bold text-white">Platform Performance</h3>
              </div>
              <p className="text-slate-300 text-sm mb-6">
                See EXACTLY which social posts bring in bookings
              </p>
              <div className="space-y-4">
                {analytics[0]?.items?.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <span className="text-rose-400 font-bold">
                        {item.value} {item.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-rose-600 to-rose-500 h-2 rounded-full"
                        style={{ width: `${(item.value / 12) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* A/B Testing & Conversion */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="text-lg font-bold text-white mb-2">A/B Testing</h3>
                <p className="text-slate-300 text-sm">
                  Test different website designs automatically
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="text-lg font-bold text-white mb-2">Conversion Tracking</h3>
                <p className="text-slate-300 text-sm">Know your conversion rates per campaign</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-r from-rose-600/20 to-purple-600/20 border border-rose-500/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Connect your accounts and start receiving instant notifications about bookings, revenue
            tracking, and marketing analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-rose-600/50">
              Connect Google Calendar
            </button>
            <button className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-300 border border-slate-600">
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 mt-16 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>© 2025 Claire Hamilton Admin Dashboard. Secure booking management & analytics.</p>
        </div>
      </div>
    </div>
  );
}
