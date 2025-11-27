
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import GeneratorForm from './components/GeneratorForm';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryList from './components/HistoryList';
import AIAssistantModal from './components/AIAssistantModal';
import Notification from './components/Notification';
import Chatbot from './components/Chatbot';
import AudioLab from './components/AudioLab';
import GroundedSearch from './components/GroundedSearch';
import UserRegistrationModal from './components/UserRegistrationModal';
import ActivityLog from './components/ActivityLog';
import FeedbackForm from './components/FeedbackForm';
import OnboardingTour from './components/OnboardingTour';
import AdminPanel from './components/AdminPanel';
import { View, Module, FormData, HistoryItem, NotificationType, GeneratedSection, ActivityLogItem, FeedbackItem, ShareableLink } from './types';
import { getCPSuggestions, getTopicSuggestions, generateAdminContent, generateSoalContentSections, generateEcourseContent } from './services/geminiService';

const ADMIN_USER = "Admin Guru";

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<GeneratedSection[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isCpModalOpen, setIsCpModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState<Partial<FormData>>({});
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const [lastSubmittedFormData, setLastSubmittedFormData] = useState<FormData | null>(null);
  const [savedSession, setSavedSession] = useState<HistoryItem | null>(null);
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [shareableLinks, setShareableLinks] = useState<ShareableLink[]>([]);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [registeredTeachers, setRegisteredTeachers] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      // User check
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(storedUser);
      } else {
        setIsUserModalOpen(true);
      }
      
      // Activity Log
      const storedLog = localStorage.getItem('activityLog');
      if (storedLog) setActivityLog(JSON.parse(storedLog));

      // Feedback
      const storedFeedback = localStorage.getItem('appFeedback');
      if (storedFeedback) setFeedback(JSON.parse(storedFeedback));

      const storedHistory = localStorage.getItem('generationHistory');
      if (storedHistory) setHistory(JSON.parse(storedHistory));

      const savedSessionData = localStorage.getItem('savedGenerationSession');
      if (savedSessionData) setSavedSession(JSON.parse(savedSessionData));

      const storedTeachers = localStorage.getItem('registeredTeachers');
      if (storedTeachers) setRegisteredTeachers(JSON.parse(storedTeachers));

      // Shareable Links & Referral Tracking
      const storedLinks = localStorage.getItem('shareableLinks');
      const links = storedLinks ? JSON.parse(storedLinks) : [];
      
      const urlParams = new URLSearchParams(window.location.search);
      const refId = urlParams.get('ref');
      if (refId) {
          const linkIndex = links.findIndex((link: ShareableLink) => link.id === refId);
          if (linkIndex !== -1) {
              links[linkIndex].usageCount += 1;
              localStorage.setItem('shareableLinks', JSON.stringify(links));
          }
          // Clean the URL after tracking
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('ref');
          window.history.replaceState({}, document.title, newUrl.toString());
      }
      setShareableLinks(links);

    } catch (error) {
      console.error("Failed to load data from localStorage or track referral", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('generationHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);
  
  useEffect(() => {
    try {
      localStorage.setItem('shareableLinks', JSON.stringify(shareableLinks));
    } catch (error) {
      console.error("Failed to save shareable links to localStorage", error);
    }
  }, [shareableLinks]);

  useEffect(() => {
    try {
        localStorage.setItem('activityLog', JSON.stringify(activityLog));
    } catch (error) {
        console.error("Failed to save activity log to localStorage", error);
    }
  }, [activityLog]);

  useEffect(() => {
    try {
        localStorage.setItem('appFeedback', JSON.stringify(feedback));
    } catch (error) {
        console.error("Failed to save feedback to localStorage", error);
    }
  }, [feedback]);

  useEffect(() => {
    try {
        localStorage.setItem('registeredTeachers', JSON.stringify(registeredTeachers));
    } catch (error) {
        console.error("Failed to save registered teachers to localStorage", error);
    }
  }, [registeredTeachers]);
  
  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const handleSaveSession = () => {
    if (generatedSections.length > 0 && lastSubmittedFormData && currentModule) {
      const sessionToSave: HistoryItem = {
        id: 'saved_session',
        ...lastSubmittedFormData,
        module_type: currentModule,
        generated_sections: generatedSections,
        created_at: new Date().toISOString(),
      };
      try {
        localStorage.setItem('savedGenerationSession', JSON.stringify(sessionToSave));
        showNotification('Sesi berhasil disimpan!', 'success');
      } catch (error) {
        console.error("Failed to save session to localStorage", error);
        showNotification('Gagal menyimpan sesi.', 'error');
      }
    } else {
      showNotification('Tidak ada konten untuk disimpan.', 'warning');
    }
  };

  const handleRestoreSession = () => {
    if (savedSession) {
      setCurrentModule(savedSession.module_type);
      setLastSubmittedFormData(savedSession);
      setGeneratedSections(savedSession.generated_sections);
      setView('results');
      setSavedSession(null); 
      localStorage.removeItem('savedGenerationSession');
      showNotification('Sesi berhasil dipulihkan.', 'success');
    }
  };

  const handleDismissSavedSession = () => {
    localStorage.removeItem('savedGenerationSession');
    setSavedSession(null);
    showNotification('Sesi tersimpan telah dihapus.', 'success');
  };

  const handleModuleSelect = (module: Module | View) => {
     if (module === 'admin' || module === 'soal' || module === 'ecourse') {
        setCurrentModule(module);
        setView('form');
        setGeneratedSections([]);
    } else if (module === 'adminPanel') {
        setIsAdminPanelOpen(true);
    } else {
        setView(module as View);
    }
  };
  
  const handleBack = () => {
    setView('dashboard');
    setCurrentModule(null);
    setGeneratedSections([]);
  };

  const handleNewGeneration = () => {
    setView('form');
    setGeneratedSections([]);
  }
  
  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);
  
  const addActivityLog = (formData: FormData, module: Module) => {
    if (!currentUser) return;
    const details = module === 'ecourse' 
      ? `${formData.topik_ecourse} - ${formData.jumlah_pertemuan} Pertemuan`
      : `${formData.mata_pelajaran} - Kelas ${formData.kelas}`;

    const newLog: ActivityLogItem = {
      id: Date.now().toString(),
      user: currentUser,
      module_type: module,
      details: details,
      created_at: new Date().toISOString(),
    };
    setActivityLog(prev => [newLog, ...prev]);
  };

  const startLoadingSimulation = (formData: FormData) => {
      setIsLoading(true);
      setGeneratedSections([]);
      setLastSubmittedFormData(formData);
      setGenerationProgress(0);
      clearProgressInterval();

      const SIMULATED_DURATION = formData.use_thinking_mode ? 15000 : 8000;
      const MAX_SIMULATED_PROGRESS = 95;
      const startTime = Date.now();

      progressIntervalRef.current = window.setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(
          (elapsedTime / SIMULATED_DURATION) * 100,
          MAX_SIMULATED_PROGRESS
        );
        setGenerationProgress(progress);
        if (progress >= MAX_SIMULATED_PROGRESS) {
          clearProgressInterval();
        }
      }, 100);
  }
  
  const finishLoadingSimulation = (callback: () => void) => {
      clearProgressInterval();
      setGenerationProgress(100);

      setTimeout(() => {
        callback();
        setIsLoading(false);
      }, 500);
  }

  const handleFormSubmit = async (formData: FormData) => {
    if (!currentModule) return;
    
    localStorage.removeItem('savedGenerationSession');
    setSavedSession(null);
    startLoadingSimulation(formData);

    try {
      let sections: GeneratedSection[] = [];
      if (currentModule === 'admin') {
        sections = await generateAdminContent(formData);
      } else if (currentModule === 'soal') {
        sections = await generateSoalContentSections(formData);
      } else if (currentModule === 'ecourse') {
        sections = await generateEcourseContent(formData);
      }
      
      finishLoadingSimulation(() => {
          setGeneratedSections(sections);
          setView('results');
          
          const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            ...formData,
            module_type: currentModule,
            generated_sections: sections,
            created_at: new Date().toISOString(),
          };
          setHistory(prev => [newHistoryItem, ...prev]);
          addActivityLog(formData, currentModule);
          showNotification('Perangkat berhasil digenerate!', 'success');
      });

    } catch (error) {
      console.error("Error generating content:", error);
      let errorMessage = 'Terjadi kesalahan saat generate. Silakan coba lagi.';
      if (error instanceof Error) {
        const errorString = error.toString().toLowerCase();
        if (errorString.includes('permission denied')) {
            errorMessage = 'Izin akses ditolak.';
        } else if (errorString.includes('503') || errorString.includes('unavailable')) {
            errorMessage = 'Server AI sedang sibuk setelah beberapa kali percobaan otomatis. Mohon coba lagi nanti.';
        }
      }
      showNotification(errorMessage, 'error');
      setView('form');
      setIsLoading(false);
      clearProgressInterval();
      setGenerationProgress(0);
    }
  };

  const handleShowAIAssistant = (data: Partial<FormData>, type: 'cp' | 'topic') => {
    if(!data.jenjang || !data.kelas || !data.mata_pelajaran) {
      showNotification('Pilih jenjang, kelas, dan mata pelajaran terlebih dahulu', 'warning');
      return;
    }
    setModalFormData(data);
    if (type === 'cp') {
      setIsCpModalOpen(true);
    } else {
      setIsTopicModalOpen(true);
    }
  };

  const handleViewHistory = (item: HistoryItem) => {
    setCurrentModule(item.module_type);
    setLastSubmittedFormData(item);
    setGeneratedSections(item.generated_sections);
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    showNotification('Riwayat berhasil dihapus', 'success');
  };

  const handleUpdateSectionContent = (id: string, newContent: string) => {
    setGeneratedSections(prevSections =>
        prevSections.map(section =>
            section.id === id ? { ...section, content: newContent } : section
        )
    );
  };

  const handleDeleteSection = (id: string) => {
      setGeneratedSections(prevSections =>
          prevSections.filter(section => section.id !== id)
      );
  };
  
  const handleSaveUser = (name: string) => {
    try {
      localStorage.setItem('currentUser', name);
      localStorage.setItem('hasCompletedOnboardingTour', 'false');
      setCurrentUser(name);
      setIsUserModalOpen(false);
      showNotification(`Selamat datang, ${name}!`, 'success');
      // Delay starting the tour slightly to allow the dashboard to render
      setTimeout(() => {
        const hasCompletedTour = localStorage.getItem('hasCompletedOnboardingTour') === 'true';
        if (!hasCompletedTour) {
          setIsTourOpen(true);
        }
      }, 500);
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
      showNotification('Gagal menyimpan nama pengguna.', 'error');
    }
  };

  const handleFeedbackSubmit = (rating: number, comment: string) => {
    if (!currentUser) {
        showNotification('Gagal mengirim masukan, pengguna tidak ditemukan.', 'error');
        return;
    }
    const newFeedback: FeedbackItem = {
        id: Date.now().toString(),
        user: currentUser,
        rating,
        comment,
        created_at: new Date().toISOString(),
    };
    setFeedback(prev => [newFeedback, ...prev]);
    showNotification('Terima kasih atas masukan Anda!', 'success');
  };

  const handleTourComplete = () => {
    try {
        localStorage.setItem('hasCompletedOnboardingTour', 'true');
        setIsTourOpen(false);
    } catch (error) {
        console.error("Failed to save tour completion status", error);
    }
  };

  const handleAddLink = (userName: string) => {
    const newId = `user_${Date.now()}`;
    
    // FIX: Construct the URL using the root path '/' to avoid including dynamic,
    // non-existent paths from the current window.location.pathname, which causes 404 errors.
    const url = new URL('/', window.location.origin);
    url.searchParams.set('ref', newId);
    
    const newUrl = url.toString();
    
    const newLink: ShareableLink = {
        id: newId,
        userName,
        url: newUrl,
        usageCount: 0,
        createdAt: new Date().toISOString(),
    };
    setShareableLinks(prev => [...prev, newLink]);
    showNotification(`Link baru untuk ${userName} berhasil dibuat!`, 'success');
  };

  const handleDeleteLink = (id: string) => {
      setShareableLinks(prev => prev.filter(link => link.id !== id));
      showNotification('Link berhasil dihapus.', 'success');
  };

  const handleAddTeachers = (newTeachers: string[]) => {
      setRegisteredTeachers(prev => {
          const combined = [...prev, ...newTeachers];
          const uniqueTeachers = [...new Set(combined)]; // Remove duplicates
          showNotification(`${newTeachers.length} guru berhasil ditambahkan.`, 'success');
          return uniqueTeachers;
      });
  };

  const handleBackupData = () => {
      try {
          const storedKaryawan = localStorage.getItem('dataKaryawan');
          const dataKaryawan = storedKaryawan ? JSON.parse(storedKaryawan) : [];

          const backupData = {
              version: '1.1', // Incremented version for new data structure
              timestamp: new Date().toISOString(),
              history,
              activityLog,
              feedback,
              shareableLinks,
              registeredTeachers,
              currentUser,
              dataKaryawan, // Include performance report data
          };
          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `guru_inovatif_backup_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showNotification('Data berhasil di-backup!', 'success');
      } catch (error) {
          console.error("Backup failed:", error);
          showNotification('Gagal membuat backup data.', 'error');
      }
  };
  
  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result as string;
              const data = JSON.parse(text);

              if (!data.version || !data.timestamp) {
                  throw new Error("Invalid backup file format.");
              }
              
              if (data.history) setHistory(data.history);
              if (data.activityLog) setActivityLog(data.activityLog);
              if (data.feedback) setFeedback(data.feedback);
              if (data.shareableLinks) setShareableLinks(data.shareableLinks);
              if (data.registeredTeachers) setRegisteredTeachers(data.registeredTeachers);
              // Restore performance report data
              if (data.dataKaryawan) {
                  localStorage.setItem('dataKaryawan', JSON.stringify(data.dataKaryawan));
              }
              
              showNotification('Data berhasil dipulihkan! Aplikasi akan dimuat ulang.', 'success');
              setTimeout(() => window.location.reload(), 2000);
          } catch (err) {
              console.error("Restore failed:", err);
              showNotification('File backup tidak valid atau rusak.', 'error');
          }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset file input
  };

  const renderContent = () => {
    switch(view) {
        case 'dashboard':
            return <Dashboard onModuleSelect={handleModuleSelect} currentUser={currentUser} />;
        case 'form':
            return currentModule && (
                <GeneratorForm 
                    module={currentModule} 
                    onSubmit={handleFormSubmit}
                    onBack={handleBack}
                    onShowAIAssistant={handleShowAIAssistant}
                    isLoading={isLoading}
                    generationProgress={generationProgress}
                />
            );
        case 'results':
            return generatedSections.length > 0 && lastSubmittedFormData && (
                <ResultsDisplay 
                    module={currentModule!}
                    sections={generatedSections}
                    formData={lastSubmittedFormData}
                    onUpdateSectionContent={handleUpdateSectionContent}
                    onDeleteSection={handleDeleteSection}
                    onNewGeneration={() => setView('form')}
                    onBack={handleBack}
                    onSaveSession={handleSaveSession}
                />
            );
        case 'audioLab':
            return <AudioLab onBack={handleBack} />;
        case 'groundedSearch':
            return <GroundedSearch onBack={handleBack} />;
        default:
            return <Dashboard onModuleSelect={handleModuleSelect} currentUser={currentUser} />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentUser={currentUser} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === 'dashboard' && savedSession && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md shadow-lg" role="alert">
            <h3 className="font-bold">Sesi Tersimpan Ditemukan</h3>
            <p>Anda memiliki pekerjaan yang belum selesai dari <span className="font-medium">{new Date(savedSession.created_at).toLocaleString('id-ID')}</span>. Ingin melanjutkannya?</p>
            <div className="mt-3">
              <button onClick={handleRestoreSession} className="bg-yellow-500 text-white font-bold py-1 px-3 rounded text-sm hover:bg-yellow-600 transition-colors">
                Lanjutkan
              </button>
              <button onClick={handleDismissSavedSession} className="ml-2 border border-yellow-600 text-yellow-800 font-bold py-1 px-3 rounded text-sm hover:bg-yellow-200 transition-colors">
                Hapus
              </button>
            </div>
          </div>
        )}

        {renderContent()}
        
        {view === 'dashboard' && (
            <>
                <div className="grid lg:grid-cols-2 gap-8 mt-8">
                    <HistoryList 
                        history={history}
                        onView={handleViewHistory}
                        onDelete={handleDeleteHistory}
                    />
                    <ActivityLog
                        logs={activityLog}
                    />
                </div>
                <div className="mt-8">
                    <FeedbackForm onFeedbackSubmit={handleFeedbackSubmit} />
                </div>
            </>
        )}

      </main>
      <Footer />
      
      {isUserModalOpen && <UserRegistrationModal onSave={handleSaveUser} />}

      {isAdminPanelOpen && (
          <AdminPanel
              isOpen={isAdminPanelOpen}
              onClose={() => setIsAdminPanelOpen(false)}
              links={shareableLinks}
              onAddLink={handleAddLink}
              onDeleteLink={handleDeleteLink}
              onBackupData={handleBackupData}
              onRestoreData={handleRestoreData}
              onAddTeachers={handleAddTeachers}
          />
      )}

      {(isCpModalOpen || isTopicModalOpen) && (
        <AIAssistantModal 
          isOpen={isCpModalOpen || isTopicModalOpen}
          onClose={isCpModalOpen ? () => setIsCpModalOpen(false) : () => setIsTopicModalOpen(false)}
          formData={modalFormData}
          getSuggestions={isCpModalOpen ? getCPSuggestions : getTopicSuggestions}
          suggestionType={'markdown'}
          title={isCpModalOpen ? 'AI Asisten - Bantuan CP' : 'AI Asisten - Bantuan Topik'}
          description={isCpModalOpen 
            ? 'AI telah membuat beberapa saran Elemen CP dalam format Markdown. Anda bisa menyalin atau langsung menerapkannya ke dalam kolom.'
            : 'AI telah membuat beberapa saran Topik/Materi dalam format Markdown. Anda bisa menyalin atau langsung menerapkannya.'
          }
          targetElementId={isCpModalOpen ? 'cp_elements' : 'topik_materi'}
        />
      )}

      {notification && <Notification message={notification.message} type={notification.type} />}
      <Chatbot />
      <OnboardingTour isOpen={isTourOpen} onComplete={handleTourComplete} />
    </div>
  );
};

export default App;
