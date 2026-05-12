import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatWeekRange, getWeekStart, getWeekNumber } from '@/lib/scheduler'

interface WeekNavigationProps {
  weekStart: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
}

export function WeekNavigation({ weekStart, onPrevWeek, onNextWeek, onToday }: WeekNavigationProps) {
  const isCurrentWeek = format(getWeekStart(new Date()), 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd')
  const weekNum = getWeekNumber(weekStart)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onPrevWeek} className="nav-button">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={onNextWeek} className="nav-button">
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isCurrentWeek && (
            <Button variant="ghost" size="sm" onClick={onToday} className="text-xs">
              <CalendarDays className="h-3 w-3 mr-1" />
              本周
            </Button>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">
            {formatWeekRange(weekStart)}
          </div>
          {weekNum !== null && (
            <div className="text-[11px] text-muted-foreground">
              第 {weekNum} 周
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
