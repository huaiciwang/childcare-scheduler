declare module 'date-fns' {
  export function startOfWeek(date: Date | number, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date
  export function addDays(date: Date | number, amount: number): Date
  export function addWeeks(date: Date | number, amount: number): Date
  export function subWeeks(date: Date | number, amount: number): Date
  export function format(date: Date | number, formatStr: string, options?: { locale?: unknown }): string
}

declare module 'date-fns/locale' {
  export const zhCN: unknown
}
