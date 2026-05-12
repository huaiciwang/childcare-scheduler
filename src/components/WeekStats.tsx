import { useMemo } from 'react'
import { type TimeSlot, type AppSettings } from '@/lib/scheduler'

interface WeekStatsProps {
  slots: TimeSlot[]
  settings: AppSettings
}

export function WeekStats({ slots, settings }: WeekStatsProps) {
  const stats = useMemo(() => {
    const papa = slots.filter(s => s.assignee === 'papa' || s.assignee === 'both').length
    const mama = slots.filter(s => s.assignee === 'mama' || s.assignee === 'both').length
    const grandparents = slots.filter(s => s.assignee === 'grandparents' || s.assignee === 'both').length
    const unassigned = slots.filter(s => !s.assignee).length
    const total = slots.length
    return { papa, mama, grandparents, unassigned, total }
  }, [slots])

  const papaName = settings.parents[0]?.name || '爸爸'
  const mamaName = settings.parents[1]?.name || '妈妈'
  const grandparentsName = settings.parents[2]?.name || '爷爷奶奶'

  const papaPercent = stats.total > 0 ? (stats.papa / stats.total) * 100 : 0
  const mamaPercent = stats.total > 0 ? (stats.mama / stats.total) * 100 : 0
  const grandparentsPercent = stats.total > 0 ? (stats.grandparents / stats.total) * 100 : 0

  return (
    <div className="rounded-lg border bg-card p-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-muted-foreground">本周分配统计</span>
        {stats.unassigned > 0 && (
          <span className="text-warning font-medium">{stats.unassigned} 个时段未分配</span>
        )}
      </div>
      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden flex">
        <div
          className="h-full bg-papa transition-all duration-500"
          style={{ width: `${papaPercent}%` }}
        />
        <div
          className="h-full bg-mama transition-all duration-500"
          style={{ width: `${mamaPercent}%` }}
        />
        <div
          className="h-full bg-grandparents transition-all duration-500"
          style={{ width: `${grandparentsPercent}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[11px]">
        <span className="text-papa font-medium">{papaName}: {stats.papa}次</span>
        <span className="text-mama font-medium">{mamaName}: {stats.mama}次</span>
        <span className="text-grandparents font-medium">{grandparentsName}: {stats.grandparents}次</span>
      </div>
    </div>
  )
}
