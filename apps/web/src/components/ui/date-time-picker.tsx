"use client"

import * as React from "react"
import { CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/utils"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

function parseISO(value?: string): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

interface DateTimePickerProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
}

function DateTimePicker({
  value,
  onValueChange,
  placeholder = "Pick a date & time",
  className,
  id,
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const date = parseISO(value)

  const emit = (d: Date) => onValueChange?.(d.toISOString())

  const handleSelectDay = (day: Date | undefined) => {
    if (!day) return
    const base = date ?? new Date()
    const next = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      base.getHours(),
      base.getMinutes(),
      base.getSeconds(),
      base.getMilliseconds()
    )
    emit(next)
  }

  const updateTime = (part: "hour" | "minute", raw: string | null) => {
    if (raw === null) return
    const base = date ?? new Date()
    const next = new Date(base)
    if (part === "hour") next.setHours(Number(raw))
    else next.setMinutes(Number(raw))
    emit(next)
  }

  const display = date
    ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            id={id}
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-start gap-2 px-3 font-normal",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="size-4 shrink-0" />
            <span className="truncate">{display}</span>
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDay}
          defaultMonth={date}
          className="w-fit"
        />

        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <Clock className="size-4 shrink-0 text-muted-foreground" />
          <Select
            value={date ? String(date.getHours()).padStart(2, "0") : null}
            onValueChange={(v) => updateTime("hour", v)}
          >
            <SelectTrigger aria-label="Hour" className="w-20 justify-center">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((h) => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground select-none">:</span>
          <Select
            value={date ? String(date.getMinutes()).padStart(2, "0") : null}
            onValueChange={(v) => updateTime("minute", v)}
          >
            <SelectTrigger aria-label="Minute" className="w-20 justify-center">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {MINUTES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
