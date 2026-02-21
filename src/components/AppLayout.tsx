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

import type { MovementEventType } from '@/types';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');

  // Desktop collapse behaviour
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile drawer behaviour (LLD-style off-canvas)
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
    setMobileSidebarOpen(false); // close drawer on mobile after navigating
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

  const handleMovementSuccess = useCallback(() => {
    setMovementType(null);
    showToast(
      movementType === 'check_out' ? 'Equipment checked out successfully' : 'Equipment returned successfully'
    );
    refreshData();
  }, [movementType, showToast, refreshData]);

  const handleImportSuccess = useCallback(() => {
    showToast('Import completed successfully');
    refreshData();
  }, [showToast, refreshData]);

  // QR scan handler — look up equipment by qr_code or asset_id and navigate
  const handleScanResult = useCallback((qrCode: string) => {
    const normalized = qrCode.trim();
    const match = equipment.find(
      eq =>
        eq.qr_code.toLowerCase() === normalized.toLowerCase() ||
        eq.asset_id.toLowerCase() === normalized.toLowerCase() ||
        normalized.toLowerCase().includes(eq.qr_code.toLowerCase())
    );
    if (match) {
      selectEquipment(match.id);
      setCurrentView('detail');
      showToast(`Navigated to ${match.name} (${match.asset_id})`, 'success');
    } else {
      showToast(`No equipment found for QR code: ${normalized}`, 'error');
    }
  }, [equipment, selectEquipment, showToast]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-300 bg-slate-900">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <AuthModal onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile sidebar (off-canvas) */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          collapsed={false}
          onToggle={() => {}}
        />
      </div>

      {/* Main content */}
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <Header
          onOpenAuth={() => setShowAuthModal(true)}
          currentView={currentView}
          onScanResult={handleScanResult}
          onToggleSidebar={() => setMobileSidebarOpen(v => !v)}
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
            equipmentId={selectedEquipment.id}
            equipmentName={`${selectedEquipment.name} (${selectedEquipment.asset_id})`}
            eventType={movementType}
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

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>
    </div>
  );
}

const AppLayout: React.FC = () => {
  return (
    <AuthProvider>
      <EquipmentProvider>
        <AppContent />
      </EquipmentProvider>
    </AuthProvider>
  );
};

export default AppLayout;
