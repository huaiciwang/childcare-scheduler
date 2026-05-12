import { useState, useEffect, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { Settings, History, Baby } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeekNavigation } from '@/components/WeekNavigation'
import { WeekGrid } from '@/components/WeekGrid'
import { WeekStats } from '@/components/WeekStats'
import { SettingsPanel } from '@/components/SettingsPanel'
import { HistoryPanel } from '@/components/HistoryPanel'
import { ToastContainer, useToast } from '@/components/Toast'
import {
  type ParentId,
  type WeekSchedule,
  type AppSettings,
  type TimeSlot,
  getWeekStart,
  getNextWeek,
  getPrevWeek,
  generateWeekSlots,
  saveSchedule,
  loadSchedule,
  loadSettings,
  saveSettings,
  addHistoryEntry,
  loadHistory,
  type HistoryEntry,
} from '@/lib/scheduler'

function App() {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()))
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { toasts, showToast } = useToast()

  const weekKey = format(weekStart, 'yyyy-MM-dd')

  // Load schedule for current week
  useEffect(() => {
    const saved = loadSchedule(weekKey)
    const freshSlots = generateWeekSlots(weekStart)
    if (saved && saved.slots.length === freshSlots.length) {
      setSlots(saved.slots)
    } else {
      // Regenerate if structure changed (e.g. new slot types) or no saved data
      setSlots(freshSlots)
    }
  }, [weekKey, weekStart])

  // Save schedule when slots change
  const persistSchedule = useCallback((updatedSlots: TimeSlot[]) => {
    const schedule: WeekSchedule = {
      weekStart: weekKey,
      slots: updatedSlots,
      lastModified: new Date().toISOString(),
    }
    saveSchedule(schedule)
  }, [weekKey])

  // Assign a parent to a slot
  const handleAssign = useCallback((slotId: string, assignee: ParentId | 'both' | null) => {
    setSlots(prev => {
      const slot = prev.find(s => s.id === slotId)
      const previousAssignee = slot?.assignee || null

      // Skip if no change
      if (previousAssignee === assignee) return prev

      const updated = prev.map(s =>
        s.id === slotId ? { ...s, assignee } : s
      )

      // Save to history
      const entry: HistoryEntry = {
        weekStart: weekKey,
        modifiedAt: new Date().toISOString(),
        action: 'assign',
        slotId,
        previousAssignee,
        newAssignee: assignee,
      }
      addHistoryEntry(entry)
      setHistory(loadHistory())

      // Persist
      persistSchedule(updated)

      // Show toast
      const parentNames = {
        papa: settings.parents[0]?.name || '爸爸',
        mama: settings.parents[1]?.name || '妈妈',
        grandparents: settings.parents[2]?.name || '爷爷奶奶',
        both: '全家一起',
      }
      if (assignee) {
        showToast(`已分配给${parentNames[assignee]}`, 'success')
      } else {
        showToast('已清除分配', 'info')
      }

      return updated
    })
  }, [weekKey, persistSchedule, settings, showToast])

  // Update note
  const handleNoteChange = useCallback((slotId: string, note: string) => {
    setSlots(prev => {
      const updated = prev.map(s =>
        s.id === slotId ? { ...s, note } : s
      )
      persistSchedule(updated)
      showToast('备注已保存', 'success')
      return updated
    })
  }, [persistSchedule, showToast])

  // Navigation
  const handlePrevWeek = useCallback(() => setWeekStart(prev => getPrevWeek(prev)), [])
  const handleNextWeek = useCallback(() => setWeekStart(prev => getNextWeek(prev)), [])
  const handleToday = useCallback(() => setWeekStart(getWeekStart(new Date())), [])

  // Settings
  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
    showToast('设置已保存', 'success')
  }, [showToast])

  const handleImportSuccess = useCallback(() => {
    setSettings(loadSettings())
    setHistory(loadHistory())
    const saved = loadSchedule(weekKey)
    if (saved) setSlots(saved.slots)
    showToast('数据导入成功', 'success')
  }, [weekKey, showToast])

  // Check for unassigned slots
  const unassignedCount = useMemo(() => slots.filter(s => !s.assignee).length, [slots])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="week-header px-4 pt-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Baby className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-base font-bold text-foreground">带娃排班</h1>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(true)}
                className="relative"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <WeekNavigation
            weekStart={weekStart}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onToday={handleToday}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-4 max-w-4xl mx-auto">
        {/* Stats */}
        <div className="mb-4">
          <WeekStats slots={slots} settings={settings} />
        </div>

        {/* Week grid */}
        <WeekGrid
          weekStart={weekStart}
          slots={slots}
          settings={settings}
          onAssign={handleAssign}
          onNoteChange={handleNoteChange}
        />

        {/* Unassigned warning */}
        {unassignedCount > 0 && (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-3 text-center">
            <p className="text-xs text-warning font-medium">
              还有 {unassignedCount} 个时段未分配，请及时安排
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={() => setShowSettings(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
      {showHistory && (
        <HistoryPanel
          history={history}
          settings={settings}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Toast */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App
