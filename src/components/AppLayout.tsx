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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');

  // Desktop collapse behaviour
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile drawer behaviour
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
    return <div className="h-screen flex items-center justify-center text-slate-600">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f9fb]">
        <AuthModal onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#f8f9fb] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header + Mobile Drawer Trigger */}
        <div className="relative">
          {/* Mobile Hamburger + Drawer */}
          <div className="md:hidden absolute left-2 top-2 z-50">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/90 backdrop-blur px-3 py-2 shadow-sm"
                >
                  <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="p-0 w-[82vw] max-w-[340px]">
                <Sidebar
                  currentView={currentView}
                  onNavigate={handleNavigate}
                  collapsed={false}
                  onToggle={() => {}}
                />
              </SheetContent>
            </Sheet>
          </div>

          <Header
            onOpenAuth={() => setShowAuthModal(true)}
            currentView={currentView}
            onScanResult={handleScanResult}
          />
        </div>

        <main className="flex-1 overflow-hidden">
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
        </main>
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
