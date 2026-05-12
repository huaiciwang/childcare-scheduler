import { useState } from 'react'
import { X, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type AppSettings, exportData, importData } from '@/lib/scheduler'

interface SettingsPanelProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
  onClose: () => void
  onImportSuccess: () => void
}

export function SettingsPanel({ settings, onSettingsChange, onClose, onImportSuccess }: SettingsPanelProps) {
  const [papaName, setPapaName] = useState(settings.parents[0]?.name || '爸爸')
  const [mamaName, setMamaName] = useState(settings.parents[1]?.name || '妈妈')
  const [grandparentsName, setGrandparentsName] = useState(settings.parents[2]?.name || '爷爷奶奶')
  const [importError, setImportError] = useState('')

  const handleSave = () => {
    const newSettings: AppSettings = {
      ...settings,
      parents: [
        { ...settings.parents[0], name: papaName },
        { ...settings.parents[1], name: mamaName },
        { id: 'grandparents' as const, name: grandparentsName, color: 'grandparents' },
      ],
    }
    onSettingsChange(newSettings)
    onClose()
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `childcare-schedule-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        if (importData(text)) {
          setImportError('')
          onImportSuccess()
          onClose()
        } else {
          setImportError('导入失败，请检查文件格式')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm mx-4 rounded-xl border bg-card p-5" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">设置</h2>
          <button onClick={onClose} className="nav-button">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Name settings */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              监护人 1 名称
            </label>
            <input
              type="text"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={papaName}
              onChange={(e) => setPapaName(e.target.value)}
              placeholder="爸爸"
            />
            <div className="mt-1 h-1 w-full rounded-full bg-papa/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              监护人 2 名称
            </label>
            <input
              type="text"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={mamaName}
              onChange={(e) => setMamaName(e.target.value)}
              placeholder="妈妈"
            />
            <div className="mt-1 h-1 w-full rounded-full bg-mama/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              监护人 3 名称
            </label>
            <input
              type="text"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={grandparentsName}
              onChange={(e) => setGrandparentsName(e.target.value)}
              placeholder="爷爷奶奶"
            />
            <div className="mt-1 h-1 w-full rounded-full bg-grandparents/30" />
          </div>
        </div>

        {/* Data management */}
        <div className="border-t pt-4 mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">数据管理</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="flex-1">
              <Download className="h-3 w-3 mr-1" />
              导出
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport} className="flex-1">
              <Upload className="h-3 w-3 mr-1" />
              导入
            </Button>
          </div>
          {importError && (
            <p className="text-xs text-destructive mt-2">{importError}</p>
          )}
        </div>

        <Button className="w-full" onClick={handleSave}>
          保存设置
        </Button>
      </div>
    </div>
  )
}
