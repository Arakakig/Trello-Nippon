'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useRouter } from 'next/navigation';
import ProjectSettings from './ProjectSettings';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { selectedProject } = useProjectsStore();
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">Trello Nippon</h1>
          </div>

          <div className="flex items-center space-x-4">
            {selectedProject && (
              <button
                onClick={() => setShowSettings(true)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Configurações</span>
              </button>
            )}

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
      
      {showSettings && (
        <ProjectSettings onClose={() => setShowSettings(false)} />
      )}
    </nav>
  );
}

