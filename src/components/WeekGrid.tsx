import { useMemo } from 'react'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  type TimeSlot,
  type ParentId,
  type AppSettings,
  getDayName,
  formatDate,
} from '@/lib/scheduler'
import { SlotCard } from './SlotCard'

interface WeekGridProps {
  weekStart: Date
  slots: TimeSlot[]
  settings: AppSettings
  onAssign: (slotId: string, assignee: ParentId | 'both' | null) => void
  onNoteChange: (slotId: string, note: string) => void
}

export function WeekGrid({ weekStart, slots, settings, onAssign, onNoteChange }: WeekGridProps) {
  const dayColumns = useMemo(() => {
    const days: { date: string; dayOfWeek: number; slots: TimeSlot[]; isWeekend: boolean }[] = []

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayOfWeek = day.getDay()
      const daySlots = slots.filter(s => s.date === dateStr)

      days.push({
        date: dateStr,
        dayOfWeek,
        slots: daySlots,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      })
    }

    return days
  }, [weekStart, slots])

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex flex-col gap-2">
      {dayColumns.map((day) => (
        <div
          key={day.date}
          className={cn(
            'rounded-lg border bg-card p-3',
            day.isWeekend && 'bg-accent/30 border-accent',
            day.date === today && 'ring-2 ring-primary/30',
          )}
        >
          {/* Day header row */}
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              'inline-flex items-center justify-center h-6 px-2 rounded-md text-xs font-medium',
              day.date === today && 'bg-primary text-primary-foreground',
              day.date !== today && 'bg-secondary text-secondary-foreground',
            )}>
              {getDayName(day.dayOfWeek)}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(day.date, 'M月d日')}
            </span>
            {day.date === today && (
              <span className="text-[10px] text-primary font-medium">今天</span>
            )}
          </div>
          {/* Slots in horizontal grid */}
          <div className="grid grid-cols-3 gap-2">
            {day.slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                settings={settings}
                onAssign={onAssign}
                onNoteChange={onNoteChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
