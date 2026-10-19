/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { NewsProvider, useNews } from './context/NewsContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CategoryPage } from './components/CategoryPage';
import { LivePlayerModal } from './components/LivePlayerModal';
import { AdminPortal } from './components/AdminPortal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { EpaperModal } from './components/EpaperModal';
import { EditorialModal } from './components/EditorialModal';
import { PhotosModal } from './components/PhotosModal';
import { ContactModal } from './components/ContactModal';
import { AuthModal } from './components/AuthModal';
import { JournalistProfileModal } from './components/JournalistProfileModal';
import { UploadNewsModal } from './components/UploadNewsModal';
import { MyNewsModal } from './components/MyNewsModal';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import { RadioPage } from './components/RadioPage';
import { RecordVoiceModal } from './components/RecordVoiceModal';

const AppContent: React.FC = () => {
  const { activeCategory, setActiveCategory, isAdminOpen, setIsAdminOpen } = useNews();
  useEffect(() => {
    const onNavigate = () => {
      setIsAdminOpen(window.location.pathname === '/admin');
      setActiveCategory(window.location.pathname === '/radio' ? 'radio' : 'home');
    };
    window.addEventListener('popstate', onNavigate);
    return () => window.removeEventListener('popstate', onNavigate);
  }, []);
  useEffect(() => {
    const target = isAdminOpen ? '/admin' : activeCategory === 'radio' ? '/radio' : '/';
    if (window.location.pathname !== target) window.history.pushState({}, '', target);
  }, [activeCategory, isAdminOpen]);

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Global Navigation & Breaking News Ticker */}
      <Navbar />

      {/* Main Screen: Home Page, AV Radio Page OR Category Archives */}
      <main className="flex-1">
        {activeCategory === 'home' ? (
          <HomePage />
        ) : activeCategory === 'radio' ? (
          <RadioPage />
        ) : (
          <CategoryPage />
        )}
      </main>

      {/* Overlays and Interactive Modals */}
      <LivePlayerModal />
      <AdminPortal />
      <VideoPlayerModal />
      <EpaperModal />
      <EditorialModal />
      <PhotosModal />
      <ContactModal />

      {/* Journalist Accreditation & News Submission System */}
      <AuthModal />
      <JournalistProfileModal />
      <UploadNewsModal />
      <MyNewsModal />
      <ArticleReaderModal />

      {/* AV Radio Voice Recording Modal */}
      <RecordVoiceModal />
    </div>
  );
};

export default function App() {
  return (
    <NewsProvider>
      <AppContent />
    </NewsProvider>
  );
}
