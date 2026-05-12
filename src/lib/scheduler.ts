import { startOfWeek, addDays, format, addWeeks, subWeeks } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export type ParentId = 'papa' | 'mama' | 'grandparents'

export interface ParentInfo {
  id: ParentId
  name: string
  color: string
}

export type TimeSlotType = 'evening' | 'morning' | 'afternoon' | 'bath' | 'english' | 'sleep'

export interface TimeSlot {
  id: string // e.g. "2024-01-15_evening"
  date: string // ISO date string "2024-01-15"
  dayOfWeek: number // 0=Sunday, 1=Monday, ... 6=Saturday
  type: TimeSlotType
  assignee: ParentId | 'both' | null
  note: string
}

export interface WeekSchedule {
  weekStart: string // ISO date of Monday
  slots: TimeSlot[]
  lastModified: string
}

export interface HistoryEntry {
  weekStart: string
  modifiedAt: string
  action: string
  slotId: string
  previousAssignee: ParentId | 'both' | null
  newAssignee: ParentId | 'both' | null
}

export interface AppSettings {
  parents: ParentInfo[]
  enableNotifications: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  parents: [
    { id: 'papa', name: '爸爸', color: 'papa' },
    { id: 'mama', name: '妈妈', color: 'mama' },
    { id: 'grandparents', name: '爷爷奶奶', color: 'grandparents' },
  ],
  enableNotifications: true,
}

// Get Monday of the week for a given date
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

// Generate all time slots for a given week
export function generateWeekSlots(weekStart: Date): TimeSlot[] {
  const slots: TimeSlot[] = []

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i)
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayOfWeek = day.getDay() // 0=Sun, 1=Mon, ...

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: morning, afternoon, evening
      slots.push(
        { id: `${dateStr}_morning`, date: dateStr, dayOfWeek, type: 'morning', assignee: null, note: '' },
        { id: `${dateStr}_afternoon`, date: dateStr, dayOfWeek, type: 'afternoon', assignee: null, note: '' },
        { id: `${dateStr}_evening`, date: dateStr, dayOfWeek, type: 'evening', assignee: null, note: '' },
      )
    } else {
      // Weekday: bath, english, sleep
      slots.push(
        { id: `${dateStr}_bath`, date: dateStr, dayOfWeek, type: 'bath', assignee: null, note: '' },
        { id: `${dateStr}_english`, date: dateStr, dayOfWeek, type: 'english', assignee: null, note: '' },
        { id: `${dateStr}_sleep`, date: dateStr, dayOfWeek, type: 'sleep', assignee: null, note: '' },
      )
    }
  }

  return slots
}

// Format day name
export function getDayName(dayOfWeek: number): string {
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return names[dayOfWeek]
}

// Format slot type name
export function getSlotTypeName(type: TimeSlotType): string {
  const names: Record<TimeSlotType, string> = {
    morning: '上午',
    afternoon: '下午',
    evening: '晚上',
    bath: '洗澡',
    english: '英语打卡',
    sleep: '哄睡',
  }
  return names[type]
}

// Format date with locale
export function formatDate(dateStr: string, fmt: string = 'M月d日'): string {
  return format(new Date(dateStr), fmt, { locale: zhCN })
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  return `${format(weekStart, 'yyyy年M月d日')} - ${format(weekEnd, 'M月d日')}`
}

// Calculate week number since 2026-05-12 (the start date)
export function getWeekNumber(weekStart: Date): number | null {
  const origin = new Date('2026-05-12')
  const originWeekStart = startOfWeek(origin, { weekStartsOn: 1 })
  const diff = weekStart.getTime() - originWeekStart.getTime()
  if (diff < 0) return null
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
}

export function getNextWeek(weekStart: Date): Date {
  return addWeeks(weekStart, 1)
}

export function getPrevWeek(weekStart: Date): Date {
  return subWeeks(weekStart, 1)
}

// LocalStorage keys
const STORAGE_KEYS = {
  schedules: 'childcare_schedules',
  settings: 'childcare_settings',
  history: 'childcare_history',
}

// Save/load schedule
export function saveSchedule(schedule: WeekSchedule): void {
  const schedules = loadAllSchedules()
  const index = schedules.findIndex(s => s.weekStart === schedule.weekStart)
  if (index >= 0) {
    schedules[index] = schedule
  } else {
    schedules.push(schedule)
  }
  localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(schedules))
}

export function loadSchedule(weekStart: string): WeekSchedule | null {
  const schedules = loadAllSchedules()
  return schedules.find(s => s.weekStart === weekStart) || null
}

export function loadAllSchedules(): WeekSchedule[] {
  const raw = localStorage.getItem(STORAGE_KEYS.schedules)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// Save/load settings
export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
}

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(STORAGE_KEYS.settings)
  if (!raw) return DEFAULT_SETTINGS
  try {
    return JSON.parse(raw)
  } catch {
    return DEFAULT_SETTINGS
  }
}

// History management
export function addHistoryEntry(entry: HistoryEntry): void {
  const history = loadHistory()
  history.unshift(entry)
  // Keep last 200 entries
  if (history.length > 200) history.length = 200
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history))
}

export function loadHistory(): HistoryEntry[] {
  const raw = localStorage.getItem(STORAGE_KEYS.history)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// Export data
export function exportData(): string {
  return JSON.stringify({
    schedules: loadAllSchedules(),
    settings: loadSettings(),
    history: loadHistory(),
    exportedAt: new Date().toISOString(),
  }, null, 2)
}

// Import data
export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json)
    if (data.schedules) {
      localStorage.setItem(STORAGE_KEYS.schedules, JSON.stringify(data.schedules))
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data.settings))
    }
    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(data.history))
    }
    return true
  } catch {
    return false
  }
}
