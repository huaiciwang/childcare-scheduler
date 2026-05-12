import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  type TimeSlot,
  type ParentId,
  type AppSettings,
  getSlotTypeName,
} from '@/lib/scheduler'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'

interface SlotCardProps {
  slot: TimeSlot
  settings: AppSettings
  onAssign: (slotId: string, assignee: ParentId | 'both' | null) => void
  onNoteChange: (slotId: string, note: string) => void
}

export function SlotCard({ slot, settings, onAssign, onNoteChange }: SlotCardProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState(slot.note)

  const parentNames = {
    papa: settings.parents[0]?.name || '爸爸',
    mama: settings.parents[1]?.name || '妈妈',
    grandparents: settings.parents[2]?.name || '爷爷奶奶',
    both: '全家',
  }

  const handleAssign = useCallback((assignee: ParentId | 'both' | null) => {
    onAssign(slot.id, assignee)
    setShowSelector(false)
  }, [onAssign, slot.id])

  const handleNoteSave = useCallback(() => {
    onNoteChange(slot.id, noteText)
    setShowNote(false)
  }, [onNoteChange, slot.id, noteText])

  const cardClass = cn(
    'slot-card relative',
    slot.assignee === 'papa' && 'slot-card-papa',
    slot.assignee === 'mama' && 'slot-card-mama',
    slot.assignee === 'grandparents' && 'slot-card-grandparents',
    slot.assignee === 'both' && 'slot-card-both',
    !slot.assignee && 'border-dashed',
  )

  return (
    <>
      <div className="animate-fade-in">
        <div className={cardClass} onClick={() => setShowSelector(true)}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {getSlotTypeName(slot.type)}
            </span>
            {slot.note && (
              <MessageCircle className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          <div className="mt-1">
            {slot.assignee ? (
              <span className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                slot.assignee === 'papa' && 'badge-papa',
                slot.assignee === 'mama' && 'badge-mama',
                slot.assignee === 'grandparents' && 'badge-grandparents',
                slot.assignee === 'both' && 'badge-both',
              )}>
                {parentNames[slot.assignee]}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground/60">
                点击分配
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom sheet selector - works well on mobile */}
      {showSelector && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSelector(false)}
        >
          <div
            className="w-full sm:max-w-xs mx-0 sm:mx-4 rounded-t-xl sm:rounded-xl border bg-card p-4 animate-fade-in"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">
                {getSlotTypeName(slot.type)} - 分配负责人
              </span>
              <button onClick={() => setShowSelector(false)} className="nav-button h-7 w-7">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="papa"
                size="default"
                className="w-full justify-center"
                onClick={() => handleAssign('papa')}
              >
                {parentNames.papa}
              </Button>
              <Button
                variant="mama"
                size="default"
                className="w-full justify-center"
                onClick={() => handleAssign('mama')}
              >
                {parentNames.mama}
              </Button>
              <Button
                variant="grandparents"
                size="default"
                className="w-full justify-center"
                onClick={() => handleAssign('grandparents')}
              >
                {parentNames.grandparents}
              </Button>
              <Button
                variant="both"
                size="default"
                className="w-full justify-center"
                onClick={() => handleAssign('both')}
              >
                全家一起
              </Button>
              {slot.assignee && (
                <Button
                  variant="outline"
                  size="default"
                  className="w-full justify-center text-muted-foreground"
                  onClick={() => handleAssign(null)}
                >
                  清除分配
                </Button>
              )}
              <Button
                variant="ghost"
                size="default"
                className="w-full justify-center text-muted-foreground"
                onClick={() => { setShowSelector(false); setShowNote(true) }}
              >
                <MessageCircle className="h-4 w-4 mr-1.5" />
                {slot.note ? '编辑备注' : '添加备注'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Note editor - also as bottom sheet */}
      {showNote && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowNote(false)}
        >
          <div
            className="w-full sm:max-w-xs mx-0 sm:mx-4 rounded-t-xl sm:rounded-xl border bg-card p-4 animate-fade-in"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">备注</span>
              <button onClick={() => setShowNote(false)} className="nav-button h-7 w-7">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="添加备注信息..."
            />
            <Button
              className="w-full mt-3"
              onClick={handleNoteSave}
            >
              保存备注
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
