import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';
import { DashboardPage } from './pages/DashboardPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { SettingsPage } from './pages/SettingsPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import type { ActiveTab } from './types';

const MainAppContent: React.FC = () => {
  // Splash screen state: stays for exactly 5 seconds on load/refresh
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'CareTrack | Care Starts Here';
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <SplashScreen
        durationMs={5000}
        onComplete={() => setShowSplash(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex text-slate-900 font-sans">
      {/* Left-Side Vertical Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main dashboard/content area to the right of the sidebar */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              onOpenAddAppointment={() => {
                setActiveTab('appointments');
                setAppointmentModalOpen(true);
              }}
              onOpenAddMedicine={() => {
                setActiveTab('medicines');
                setMedicineModalOpen(true);
              }}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsPage
              modalOpen={appointmentModalOpen}
              setModalOpen={setAppointmentModalOpen}
            />
          )}

          {activeTab === 'medicines' && (
            <MedicinesPage
              modalOpen={medicineModalOpen}
              setModalOpen={setMedicineModalOpen}
            />
          )}

          {activeTab === 'ai-assistant' && <AIAssistantPage />}

          {activeTab === 'settings' && (
            <SettingsPage onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <DataProvider>
          <MainAppContent />
        </DataProvider>
      </NotificationProvider>
    </ToastProvider>
  );
}
