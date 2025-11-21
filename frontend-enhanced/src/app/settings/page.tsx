'use client';

import { AppLayout } from '../../components/layout/AppLayout';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-200 mb-6">Settings</h1>
        
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Language
                </label>
                <select className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200">
                  <option>English</option>
                  <option>Русский</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Theme
                </label>
                <select className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200">
                  <option>Dark</option>
                  <option>Light</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">AI Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Default Model
                </label>
                <select className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200">
                  <option>Gemini</option>
                  <option>GPT-4</option>
                  <option>Perplexity</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-slate-300">Enable QA-Gate validation</span>
                </label>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400">
                  Administrator
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
