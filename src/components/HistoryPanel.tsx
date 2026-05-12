import { useMemo } from 'react'
import { X } from 'lucide-react'
import {
  type HistoryEntry,
  type AppSettings,
  formatDate,
  getSlotTypeName,
  getDayName,
  type TimeSlotType,
} from '@/lib/scheduler'

interface HistoryPanelProps {
  history: HistoryEntry[]
  settings: AppSettings
  onClose: () => void
}

export function HistoryPanel({ history, settings, onClose }: HistoryPanelProps) {
  const parentNames = useMemo(() => ({
    papa: settings.parents[0]?.name || '爸爸',
    mama: settings.parents[1]?.name || '妈妈',
    grandparents: settings.parents[2]?.name || '爷爷奶奶',
    both: '全家',
  }), [settings])

  const getAssigneeName = (assignee: string | null): string => {
    if (!assignee) return '未分配'
    return parentNames[assignee as keyof typeof parentNames] || assignee
  }

  const parseSlotId = (slotId: string): { date: string; type: TimeSlotType } | null => {
    const parts = slotId.split('_')
    if (parts.length >= 2) {
      return {
        date: parts[0],
        type: parts[1] as TimeSlotType,
      }
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md sm:mx-4 rounded-t-xl sm:rounded-xl border bg-card max-h-[80vh] flex flex-col" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-base font-semibold text-foreground">修改记录</h2>
          <button onClick={onClose} className="nav-button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">暂无修改记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 50).map((entry, i) => {
                const slotInfo = parseSlotId(entry.slotId)
                return (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">
                        {slotInfo && (
                          <>
                            <span className="font-medium">
                              {formatDate(slotInfo.date, 'M月d日')}
                              {' '}
                              {getDayName(new Date(slotInfo.date).getDay())}
                              {' '}
                              {getSlotTypeName(slotInfo.type)}
                            </span>
                            {': '}
                          </>
                        )}
                        <span className="text-muted-foreground">
                          {getAssigneeName(entry.previousAssignee)} → {getAssigneeName(entry.newAssignee)}
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {new Date(entry.modifiedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
