import React, { useState, useCallback, lazy, Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { EquipmentProvider, useEquipment } from '@/context/EquipmentContext';
import { useAuth } from '@/context/AuthContext';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';

import { UI } from '@/lib/ui';
import type { MovementEventType } from '@/types';

const Dashboard = lazy(() => import('@/components/Dashboard'));
const EquipmentList = lazy(() => import('@/components/EquipmentList'));
const EquipmentDetail = lazy(() => import('@/components/EquipmentDetail'));
const EquipmentForm = lazy(() => import('@/components/EquipmentForm'));
const MovementForm = lazy(() => import('@/components/MovementForm'));
const ImportModal = lazy(() => import('@/components/ImportModal'));
const AuthModal = lazy(() => import('@/components/AuthModal'));

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [initialFilter, setInitialFilter] = useState<string | undefined>();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(false);
  const [movementType, setMovementType] = useState<MovementEventType | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { selectedEquipment, selectEquipment, refreshData, equipment } = useEquipment();
  const { isAuthenticated, isLoading } = useAuth();

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);

  const handleNavigate = useCallback((view: string, filter?: string) => {
    setCurrentView(view);
    if (filter) setInitialFilter(filter);
    else setInitialFilter(undefined);
    setMobileSidebarOpen(false);
  }, []);

  const handleSelectEquipment = useCallback((id: string) => {
    selectEquipment(id);
    setCurrentView('detail');
    setMobileSidebarOpen(false);
  }, [selectEquipment]);

  const handleBackToList = useCallback(() => {
    selectEquipment(null);
    setCurrentView('equipment');
  }, [selectEquipment]);

  const handleCreateNew = useCallback(() => {
    setEditingEquipment(false);
    setShowEquipmentForm(true);
  }, []);

  const handleEditEquipment = useCallback(() => {
    setEditingEquipment(true);
    setShowEquipmentForm(true);
  }, []);

  const handleMovement = useCallback((type: MovementEventType) => {
    setMovementType(type);
  }, []);

  const handleEquipmentFormSuccess = useCallback(() => {
    setShowEquipmentForm(false);
    showToast(editingEquipment ? 'Equipment updated successfully' : 'Equipment created successfully');
    refreshData();
  }, [editingEquipment, showToast, refreshData]);

  const handleImportSuccess = useCallback(() => {
    setShowImportModal(false);
    showToast('Equipment imported successfully');
    refreshData();
  }, [showToast, refreshData]);

  const handleMovementSuccess = useCallback(() => {
    setMovementType(null);
    showToast('Movement recorded successfully');
    refreshData();
  }, [showToast, refreshData]);

  const handleScanResult = useCallback((qrText: string) => {
    const normalized = (qrText || '').trim();
    if (!normalized) return;

    const match = equipment.find(eq =>
      (eq.qr_code && eq.qr_code.toLowerCase() === normalized.toLowerCase()) ||
      (eq.asset_id && eq.asset_id.toLowerCase() === normalized.toLowerCase())
    );

    if (match) {
      selectEquipment(match.id);
      setCurrentView('detail');
      showToast("Navigated to  ()", 'success');
      setMobileSidebarOpen(false);
    } else {
      showToast(`No equipment found for QR code: ${normalized}`, 'error');
    }
  }, [equipment, selectEquipment, showToast]);

  if (isLoading) {
    return <div className={`min-h-screen flex items-center justify-center text-slate-300 ${UI.shell}`}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${UI.shell}`}>
        <Suspense fallback={null}>
          <AuthModal onClose={() => {}} />
        </Suspense>
      </div>
    );
  }

  const Loading = <div className="text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen">
      <div className="hidden md:flex min-h-screen">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
        />

        <div className="flex-1 min-w-0">
          <Header
            onOpenAuth={() => setShowAuthModal(true)}
            currentView={currentView}
            onScanResult={handleScanResult}
            onToggleSidebar={() => setMobileSidebarOpen(v => !v)}
          />

          <div className="p-4 lg:p-6">
            <Suspense fallback={Loading}>
              {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
              {currentView === 'equipment' && (
                <EquipmentList
                  onSelectEquipment={handleSelectEquipment}
                  onCreateNew={handleCreateNew}
                  onImport={() => setShowImportModal(true)}
                  initialFilter={initialFilter}
                />
              )}
              {currentView === 'detail' && (
                <EquipmentDetail
                  onBack={handleBackToList}
                  onEdit={handleEditEquipment}
                  onMovement={handleMovement}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        {showEquipmentForm && (
          <EquipmentForm
            equipment={editingEquipment ? selectedEquipment : null}
            onClose={() => setShowEquipmentForm(false)}
            onSuccess={handleEquipmentFormSuccess}
          />
        )}

        {movementType && selectedEquipment && (
          <MovementForm
            type={movementType}
            equipment={selectedEquipment}
            onClose={() => setMovementType(null)}
            onSuccess={handleMovementSuccess}
          />
        )}

        {showImportModal && (
          <ImportModal
            onClose={() => setShowImportModal(false)}
            onSuccess={handleImportSuccess}
          />
        )}
      </Suspense>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function AppLayout() {
  return (
    <AuthProvider>
      <EquipmentProvider>
        <AppContent />
      </EquipmentProvider>
    </AuthProvider>
  );
}









