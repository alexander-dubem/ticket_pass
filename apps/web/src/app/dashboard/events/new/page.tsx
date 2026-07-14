import React from "react";
import { DashboardHeader } from "../../../../components/Dashboard/DashboardHeader";
import { EventForm } from "../../../../components/Dashboard/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <DashboardHeader
        title="Create Event"
        subtitle="Set up a new on-chain ticket drop for your audience."
      />
      <EventForm />
    </div>
  );
}
