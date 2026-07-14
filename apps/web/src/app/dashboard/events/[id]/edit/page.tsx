"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "../../../../../components/Dashboard/DashboardHeader";
import { EventForm } from "../../../../../components/Dashboard/EventForm";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}/events/${id}`)
      .then((r) => r.json())
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id, BACKEND]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20 text-zinc-500">
        Event not found or you don't have permission to edit it.
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="Edit Event" subtitle={event.title} />
      <EventForm
        eventId={id}
        initialData={{
          ...event,
          date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
          endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
        }}
      />
    </div>
  );
}
