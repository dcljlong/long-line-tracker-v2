import React, { useState } from 'react';
import { useEquipment } from '@/context/EquipmentContext';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge, TagBadge, ConditionBadge } from '@/components/ui/StatusBadge';
import { computeTagState, computeStatus } from '@/types';
import { UI } from '@/lib/ui';

interface EquipmentDetailProps {
  onBack: () => void;
  onEdit: () => void;
  onMovement: (type: 'check_out' | 'return') => void;
}

export default function EquipmentDetail({ onBack, onEdit, onMovement }: EquipmentDetailProps) {
  const { selectedEquipment: eq, selectedMovements } = useEquipment();
  const { isAdmin } = useAuth();
  const [showQR, setShowQR] = useState(false);

  if (!eq) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Equipment not found</p>
      </div>
    );
  }

  const status = computeStatus(eq);          // canonical status
  const tagState = computeTagState(eq);

  const canShowPrimaryAction = isAdmin && (status === 'Available' || status === 'In Use' || status === 'Overdue');
  const isCheckout = status === 'Available';
  const primaryLabel = isCheckout ? 'Check Out' : 'Return';
  const hasCurrentAssignment = status === 'In Use' || status === 'Overdue';

  // Schema-safe next due (some code uses test_tag_next_due_date)
  const nextDue: string | null =
    (eq as any).test_tag_next_due_date ??
    (eq as any).test_tag_next_due ??
    null;

  const daysUntilDue = nextDue
    ? Math.ceil((new Date(nextDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const qrValue = eq.qr_code;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}&color=1e3a5f&bgcolor=ffffff&margin=8`;
  const qrDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrValue)}&color=1e3a5f&bgcolor=ffffff&margin=16`;

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <div className={`px-4 sm:px-6 py-3 sm:py-4 ${UI.card} ${UI.cardPad}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <button
              onClick={onBack}
              className="p-2 hover:bg-background/40 rounded-lg transition-colors text-muted-foreground hover:text-foreground/85 shrink-0"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground bg-background/40 px-2 py-0.5 rounded">{eq.asset_id}</span>
                <StatusBadge status={status} />
                <TagBadge state={tagState} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1 truncate">{eq.name}</h2>
            </div>
          </div>

          {/* Right actions (mobile stacks, no horizontal scroll) */}
          <div className="w-full sm:w-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
            {/* Primary action (mobile full-width) */}
            {canShowPrimaryAction && (
              <button
                onClick={() => onMovement(isCheckout ? 'check_out' : 'return')}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  isCheckout
                    ? 'bg-primary text-primary-foreground hover:bg-primary'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isCheckout ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                  </svg>
                )}
                {primaryLabel}
              </button>
            )}

            {/* Secondary actions row */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowQR(!showQR)}
                className={`flex-1 sm:flex-none p-2.5 border rounded-lg transition-colors ${
                  showQR ? 'bg-primary text-primary-foreground border-ring/40' : 'border-border/70 text-foreground/85 hover:bg-background/40'
                }`}
                title="Show QR Code"
                aria-label="Show QR Code"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                </svg>
              </button>

              {isAdmin && (
                <button
                  onClick={onEdit}
                  className="flex-1 sm:flex-none px-4 py-2.5 border border-border/70 rounded-lg text-sm font-medium text-foreground/90 hover:bg-background/40 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* QR Code Panel */}
        {showQR && (
          <div className={`${UI.card} ${UI.cardPad}`}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-background/40 p-3 rounded-2xl ring-1 ring-border/70">
                <img
                  src={qrImageUrl}
                  alt={`QR Code for ${eq.asset_id}`}
                  width={200}
                  height={200}
                  className="block"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-sm font-semibold text-white mb-1">Equipment QR Code</h4>
                <p className="text-xs text-muted-foreground mb-1">Scan this code to quickly access this equipment's detail page.</p>
                <p className="text-xs font-mono text-muted-foreground bg-background/40 inline-block px-2 py-1 rounded mb-4">{eq.qr_code}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <a
                    href={qrDownloadUrl}
                    download={`${eq.asset_id}-qr.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PNG
                  </a>
                  <button
                    onClick={() => { navigator.clipboard.writeText(eq.qr_code); }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-border/70 rounded-lg text-xs font-medium text-foreground/90 hover:bg-background/40 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Copy Code
                  </button>
                  <button
                    onClick={() => {
                      const printWin = window.open('', '_blank', 'width=400,height=500');
                      if (printWin) {
                        printWin.document.write(`
                          <html><head><title>QR - ${eq.asset_id}</title>
                          <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;margin:0}
                          img{margin-bottom:16px}h2{margin:0;font-size:18px}p{margin:4px 0;color:#666;font-size:13px}</style></head>
                          <body><img src="${qrDownloadUrl}" width="250" height="250"/>
                          <h2>${eq.asset_id}</h2><p>${eq.name}</p>
                          <script>setTimeout(()=>{window.print();},500)</script></body></html>
                        `);
                        printWin.document.close();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-border/70 rounded-lg text-xs font-medium text-foreground/90 hover:bg-background/40 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                    </svg>
                    Print Label
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Equipment Info */}
            <div className={`${UI.card} p-5`}>
              <h3 className="text-sm font-semibold text-white mb-4">Equipment Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Category</dt>
                  <dd className="text-sm text-white mt-0.5">{eq.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Condition</dt>
                  <dd className="mt-0.5"><ConditionBadge condition={eq.condition} /></dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">QR Code</dt>
                  <dd className="text-sm text-white font-mono mt-0.5">{eq.qr_code}</dd>
                </div>
                {eq.notes && (
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider">Notes</dt>
                    <dd className="text-sm text-foreground/85 mt-0.5">{eq.notes}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Created</dt>
                  <dd className="text-sm text-foreground/85 mt-0.5">
                    {new Date(eq.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Compliance */}
            <div className={`${UI.card} p-5`}>
              <h3 className="text-sm font-semibold text-white mb-4">Test & Tag Compliance</h3>
              <div className={`p-4 rounded-lg mb-4 ${
                tagState === 'OK' ? 'bg-emerald-50' :
                tagState === 'Due Soon' ? 'bg-amber-50' :
                tagState === 'Expired' ? 'bg-red-500/10 ring-1 ring-red-500/20' : 'bg-background/40 ring-1 ring-border/70'
              }`}>
                <div className="flex items-center justify-between">
                  <TagBadge state={tagState} />
                  {daysUntilDue !== null && (
                    <span className={`text-sm font-bold ${
                      daysUntilDue < 0 ? 'text-red-600' :
                      daysUntilDue <= 30 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d remaining`}
                    </span>
                  )}
                </div>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Last Test</dt>
                  <dd className="text-sm text-white mt-0.5">
                    {eq.test_tag_done_date
                      ? new Date(eq.test_tag_done_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Not recorded'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Next Due</dt>
                  <dd className="text-sm text-white mt-0.5">
                    {nextDue
                      ? new Date(nextDue).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Not scheduled'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wider">Threshold</dt>
                  <dd className="text-sm text-foreground/85 mt-0.5">{eq.tag_threshold_days} days</dd>
                </div>
              </dl>
            </div>

            {/* Current Assignment */}
            {hasCurrentAssignment && (
              <div className={`${UI.card} p-5`}>
                <h3 className="text-sm font-semibold text-white mb-4">Current Assignment</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider">Assigned To</dt>
                    <dd className="text-sm text-white font-medium mt-0.5">{eq.assigned_to}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wider">Site</dt>
                    <dd className="text-sm text-white mt-0.5">{eq.assigned_site}</dd>
                  </div>
                  {eq.assigned_job && (
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase tracking-wider">Job Reference</dt>
                      <dd className="text-sm text-white font-mono mt-0.5">{eq.assigned_job}</dd>
                    </div>
                  )}
                  {eq.expected_return_date && (
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase tracking-wider">Expected Return</dt>
                      <dd className={`text-sm font-medium mt-0.5 ${
                        new Date(eq.expected_return_date) < new Date() ? 'text-red-600' : 'text-white'
                      }`}>
                        {new Date(eq.expected_return_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {new Date(eq.expected_return_date) < new Date() && ' (OVERDUE)'}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Right Column - Movement Timeline */}
          <div className="lg:col-span-2">
            <div className={`${UI.card}`}>
              <div className={`px-5 py-4 border-b ${UI.divider} flex items-center justify-between`}>
                <h3 className="font-semibold text-white">Movement History</h3>
                <span className="text-xs text-muted-foreground">{selectedMovements.length} entries</span>
              </div>

              {selectedMovements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No movement history recorded</p>
                </div>
              ) : (
                <div className="p-5">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

                    <div className="space-y-6">
                      {selectedMovements.map((m) => (
                        <div key={m.id} className="relative pl-10">
                          <div className={`absolute left-2 top-1 w-4 h-4 rounded-full border-2 border-white ${
                            m.event_type === 'check_out' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`} />

                          <div className="bg-card/40 rounded-xl p-4 ring-1 ring-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                m.event_type === 'check_out'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {m.event_type === 'check_out' ? 'Check Out' : 'Return'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(m.event_timestamp).toLocaleDateString('en-AU', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {m.assigned_to && (
                                <div>
                                  <span className="text-xs text-muted-foreground">Person</span>
                                  <p className="text-white font-medium">{m.assigned_to}</p>
                                </div>
                              )}
                              {m.site && (
                                <div>
                                  <span className="text-xs text-muted-foreground">Site</span>
                                  <p className="text-white">{m.site}</p>
                                </div>
                              )}
                              {m.job_reference && (
                                <div>
                                  <span className="text-xs text-muted-foreground">Job Ref</span>
                                  <p className="text-white font-mono text-xs">{m.job_reference}</p>
                                </div>
                              )}
                              {m.expected_return_date && (
                                <div>
                                  <span className="text-xs text-muted-foreground">Expected Return</span>
                                  <p className="text-white">
                                    {new Date(m.expected_return_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              )}
                            </div>

                            {m.notes && (
                              <p className="text-sm text-foreground/85 mt-2 pt-2 border-t border-border/70">{m.notes}</p>
                            )}

                            {(m.pickup_photo_url || m.return_photo_url) && (
                              <div className="flex gap-2 mt-2 pt-2 border-t border-border/70">
                                {m.pickup_photo_url && (
                                  <a href={m.pickup_photo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                    Pickup Photo
                                  </a>
                                )}
                                {m.return_photo_url && (
                                  <a href={m.return_photo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                    Return Photo
                                  </a>
                                )}
                              </div>
                            )}

                            <p className="text-[10px] text-muted-foreground mt-2">
                              Recorded by: {m.created_by || 'System'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
