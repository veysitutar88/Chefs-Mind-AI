
'use client';

import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="flex-1 bg-slate-900/50 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-200 mb-2">Settings</h1>
            <p className="text-slate-400 text-sm">Manage your account and preferences.</p>
          </div>

          {/* General Settings */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">General</h2>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Interface Language</label>
                <select className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-slate-200 focus:border-cyan-500/50 focus:outline-none">
                  <option>English (US)</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Theme Preference</label>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 rounded-lg bg-slate-950 border-2 border-cyan-500 cursor-pointer text-center text-sm font-medium text-cyan-400">Dark Mode</div>
                  <div className="flex-1 p-4 rounded-lg bg-slate-100 border-2 border-transparent cursor-not-allowed opacity-50 text-center text-sm font-medium text-slate-400">Light Mode</div>
                </div>
              </div>
            </div>
          </section>

          {/* Account Settings */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Account</h2>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">CM</div>
                <div>
                  <div className="font-bold text-lg text-white">Chef Admin</div>
                  <div className="text-slate-400 text-sm">admin@chefsmind.ai</div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">Administrator Access</Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
