import React, { useState, useCallback } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { EquipmentProvider, useEquipment } from '@/context/EquipmentContext';
import { useAuth } from '@/context/AuthContext';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import EquipmentList from '@/components/EquipmentList';
import EquipmentDetail from '@/components/EquipmentDetail';
import EquipmentForm from '@/components/EquipmentForm';
import MovementForm from '@/components/MovementForm';
import ImportModal from '@/components/ImportModal';
import AuthModal from '@/components/AuthModal';
import Toast from '@/components/Toast';

import { UI } from '@/lib/ui';

import type { MovementEventType } from '@/types';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');

  // Desktop sidebar collapse (LLD-style: width toggle, pushes layout)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile off-canvas sidebar
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

    // Try match on qr_code or asset_id
    const match = equipment.find(eq =>
      (eq.qr_code && eq.qr_code.toLowerCase() === normalized.toLowerCase()) ||
      (eq.asset_id && eq.asset_id.toLowerCase() === normalized.toLowerCase())
    );

    if (match) {
      selectEquipment(match.id);
      setCurrentView('detail');
      showToast(`Navigated to ${match.name} (${match.asset_id})`, 'success');
      setMobileSidebarOpen(false);
    } else {
      showToast(`No equipment found for QR code: ${normalized}`, 'error');
    }
  }, [equipment, selectEquipment, showToast]);

  const handleHeaderToggle = useCallback(() => {
    // Desktop: collapse/expand sidebar (LLD behaviour)
    if (window.matchMedia && window.matchMedia('(min-width: 768px)').matches) {
      setSidebarCollapsed(v => !v);
      return;
    }
    // Mobile: open off-canvas
    setMobileSidebarOpen(v => !v);
  }, []);

  if (isLoading) {
    return <div className={`min-h-screen flex items-center justify-center text-slate-300 ${UI.shell}`}>Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${UI.shell}`}>
        <AuthModal onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${UI.shell}`}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar (off-canvas) */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Desktop layout (pushes main content like LLD) */}
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
            onToggleSidebar={handleHeaderToggle}
          />

          <div className="p-4 lg:p-6">
            {currentView === 'dashboard' && (
              <Dashboard onNavigate={handleNavigate} />
            )}
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
          </div>
        </div>
      </div>

      {/* Mobile main (below md) */}
      <div className="md:hidden">
        <Header
          onOpenAuth={() => setShowAuthModal(true)}
          currentView={currentView}
          onScanResult={handleScanResult}
          onToggleSidebar={handleHeaderToggle}
        />

        <div className="p-4">
          {currentView === 'dashboard' && (
            <Dashboard onNavigate={handleNavigate} />
          )}
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
        </div>
      </div>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

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
