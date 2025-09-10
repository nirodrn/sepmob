import React, { useState } from 'react';
import { DashboardCards, getDashboardCards } from '../../components/Dashboard/DashboardCards';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import { useAuth } from '../../context/AuthContext';
import { Users, Settings, BarChart3, Shield, Database, Activity } from 'lucide-react';

export function AdminDashboard() {
  const { userData } = useAuth();

  if (!userData) return null;

  const cards = getDashboardCards(userData.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          System Administrator Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Complete system oversight and management controls
        </p>
      </div>

      <DashboardCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Health */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Auth Service</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Response</span>
                  <span className="text-sm text-gray-900">~120ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm text-gray-900">47</span>
                </div>
              </div>
            </div>

            {/* Recent User Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Sales request approved</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">System backup completed</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <RecentActivity activities={[]} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">User Management</p>
                  <p className="text-sm text-blue-700">Create & manage users</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">System Analytics</p>
                  <p className="text-sm text-green-700">Usage & performance</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">System Settings</p>
                  <p className="text-sm text-amber-700">Configure system</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Security Audit</p>
                  <p className="text-sm text-purple-700">Review access logs</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Data Management</p>
                  <p className="text-sm text-red-700">Backup & maintenance</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-indigo-900">Activity Monitor</p>
                  <p className="text-sm text-indigo-700">Real-time monitoring</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}