"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isToday
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  mode?: "single"
  locale?: any
}

export function Calendar({ className, selected, onSelect, disabled }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const startDate = startOfWeek(startOfMonth(currentMonth))
  const endDate = endOfWeek(endOfMonth(currentMonth))
  
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const handleDateClick = (day: Date) => {
    if (disabled && disabled(day)) return
    if (selected && isSameDay(day, selected)) {
        if (onSelect) onSelect(undefined)
    } else {
        if (onSelect) onSelect(day)
    }
  }

  return (
    <div className={cn("p-4 bg-[#0b101e] rounded border border-slate-800 shadow-lg w-fit", className)}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-mono font-bold text-sm capitalize text-slate-200">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day) => (
            <div key={day} className="text-[0.7rem] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {day}
            </div>
        ))}
      </div>
      
      {/* Grid de Dias */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
            const isDisabled = disabled ? disabled(day) : false
            const isSelected = selected ? isSameDay(day, selected) : false
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isTodayDate = isToday(day)

            return (
                <button
                    key={idx}
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={cn(
                        "h-9 w-9 rounded flex items-center justify-center text-sm transition-all relative font-mono",
                        // Cores Base (Dark Mode)
                        !isCurrentMonth && "text-slate-700",
                        isCurrentMonth && "text-slate-300 hover:bg-slate-800 hover:text-white",
                        // Hoje
                        isTodayDate && !isSelected && "bg-slate-800 text-indigo-400 border border-indigo-500/30 font-bold",
                        // Selecionado (Tema Faísca - Âmbar)
                        isSelected && "bg-amber-600 text-white hover:bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)] font-bold border border-amber-400",
                        // Desabilitado
                        isDisabled && "opacity-20 cursor-not-allowed hover:bg-transparent text-slate-600"
                    )}
                >
                    {format(day, 'd')}
                </button>
            )
        })}
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"