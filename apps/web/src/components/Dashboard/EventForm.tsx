"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { z } from "zod";
import {
  CalendarDays,
  MapPin,
  DollarSign,
  Users,
  Tag,
  FileText,
  ImageIcon,
  Loader2,
  Plus,
  X,
  Globe,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { useWallet } from "../../context/WalletContext";

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Music",
  "Tech",
  "Sports",
  "Art",
  "Food & Drink",
  "Business",
  "Education",
  "Gaming",
  "Health",
  "Other",
];

// ── Zod Schema ────────────────────────────────────────────────────────────────
const eventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long"),
  date: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number"),
  capacity: z
    .number({ message: "Capacity must be a valid number" })
    .int("Must be a whole number")
    .min(1, "At least 1 seat required")
    .max(1000000, "Capacity is too large"),
  maxPremiumPctScaled: z
    .number({ message: "Must be a valid number" })
    .min(0, "Cannot be negative")
    .max(5000, "Max 500%"),
  images: z.array(z.string().url("Each image must be a valid URL")).optional(),
  instructions: z.string().max(2000, "Instructions too long").optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean(),
});

type EventFormValues = z.infer<typeof eventSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────
interface EventFormProps {
  initialData?: Partial<EventFormValues>;
  eventId?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const EventForm: React.FC<EventFormProps> = ({ initialData, eventId }) => {
  const router = useRouter();
  const { apiFetch } = useWallet();
  const isEditing = !!eventId;

  const [tagInput, setTagInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik<EventFormValues>({
    initialValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      date: initialData?.date ?? "",
      endDate: initialData?.endDate ?? "",
      location: initialData?.location ?? "",
      price: initialData?.price ?? "10",
      capacity: initialData?.capacity ?? 100,
      maxPremiumPctScaled: initialData?.maxPremiumPctScaled ?? 150,
      images: initialData?.images ?? [],
      instructions: initialData?.instructions ?? "",
      category: initialData?.category ?? "",
      tags: initialData?.tags ?? [],
      isPublished: initialData?.isPublished ?? false,
    },
    validationSchema: toFormikValidationSchema(eventSchema),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      setSubmitError(null);
      try {
        const payload = {
          ...values,
          endDate: values.endDate || undefined,
          instructions: values.instructions || undefined,
          category: values.category || undefined,
        };
        if (isEditing) {
          await apiFetch(`/events/${eventId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await apiFetch("/events", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        router.push("/dashboard/events");
      } catch (err: any) {
        setSubmitError(err.message || "Something went wrong. Please try again.");
      }
    },
  });

  // ── Tag helpers
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !(formik.values.tags ?? []).includes(t)) {
      formik.setFieldValue("tags", [...(formik.values.tags ?? []), t]);
    }
    setTagInput("");
  };
  const removeTag = (tag: string) =>
    formik.setFieldValue("tags", (formik.values.tags ?? []).filter((t) => t !== tag));

  // ── Image helpers
  const addImage = () => {
    const url = imageInput.trim();
    if (url && !(formik.values.images ?? []).includes(url)) {
      formik.setFieldValue("images", [...(formik.values.images ?? []), url]);
    }
    setImageInput("");
  };
  const removeImage = (url: string) =>
    formik.setFieldValue("images", (formik.values.images ?? []).filter((u) => u !== url));

  // ── Helper to determine field error class
  const fieldClass = (name: keyof EventFormValues) =>
    `input-field${formik.touched[name] && formik.errors[name] ? " input-error" : ""}`;

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-6 max-w-2xl">

      {/* ── Basic Information ─────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <FileText className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Basic Information</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <FormField
            label="Event Name"
            required
            error={formik.touched.title ? formik.errors.title : undefined}
          >
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Stellar Hackathon Lagos 2025"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("title")}
            />
          </FormField>

          {/* Description */}
          <FormField
            label="Description"
            required
            error={formik.touched.description ? formik.errors.description : undefined}
            hint={`${formik.values.description.length}/5000`}
          >
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe your event — what to expect, who it's for, agenda highlights..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${fieldClass("description")} resize-none`}
            />
          </FormField>

          {/* Category */}
          <FormField
            label="Category"
            error={formik.touched.category ? formik.errors.category : undefined}
          >
            <select
              id="category"
              name="category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${fieldClass("category")} input-field-select`}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          {/* Instructions */}
          <FormField
            label="Entry Instructions"
            error={formik.touched.instructions ? formik.errors.instructions : undefined}
            hint="Dress code, ID requirements, gate info, etc."
          >
            <textarea
              id="instructions"
              name="instructions"
              rows={3}
              placeholder="e.g. Bring a valid photo ID. Smart casual dress code. Doors open 30 minutes before start."
              value={formik.values.instructions}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${fieldClass("instructions")} resize-none`}
            />
          </FormField>
        </div>
      </section>

      {/* ── Date & Location ───────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <CalendarDays className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Date & Location</h2>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Start Date & Time"
              required
              error={formik.touched.date ? formik.errors.date : undefined}
            >
              <input
                id="date"
                name="date"
                type="datetime-local"
                value={formik.values.date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={fieldClass("date")}
              />
            </FormField>

            <FormField
              label="End Date & Time"
              error={formik.touched.endDate ? formik.errors.endDate : undefined}
              hint="Optional"
            >
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={fieldClass("endDate")}
              />
            </FormField>
          </div>

          <FormField
            label="Venue / Location"
            required
            error={formik.touched.location ? formik.errors.location : undefined}
          >
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Eko Hotel, Lagos  —  or  Virtual"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`${fieldClass("location")} pl-10`}
              />
            </div>
          </FormField>
        </div>
      </section>

      {/* ── Ticketing ─────────────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <DollarSign className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Ticketing</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FormField
              label="Price (XLM)"
              required
              error={formik.touched.price ? formik.errors.price : undefined}
            >
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0.00"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`${fieldClass("price")} pl-10`}
                />
              </div>
            </FormField>

            <FormField
              label="Total Seats"
              required
              error={formik.touched.capacity ? formik.errors.capacity : undefined}
            >
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formik.values.capacity}
                  onChange={(e) =>
                    formik.setFieldValue("capacity", parseInt(e.target.value) || 0)
                  }
                  onBlur={formik.handleBlur}
                  className={`${fieldClass("capacity")} pl-10`}
                />
              </div>
            </FormField>

            <FormField
              label="Max Resale Premium (%)"
              error={
                formik.touched.maxPremiumPctScaled
                  ? formik.errors.maxPremiumPctScaled
                  : undefined
              }
              hint="Anti-scalp cap (e.g. 15%)"
            >
              <input
                id="maxPremiumPctScaled"
                name="maxPremiumPctScaled"
                type="number"
                min="0"
                max="500"
                step="1"
                placeholder="15"
                value={formik.values.maxPremiumPctScaled / 10}
                onChange={(e) =>
                  formik.setFieldValue(
                    "maxPremiumPctScaled",
                    Math.round(parseFloat(e.target.value || "0") * 10)
                  )
                }
                onBlur={formik.handleBlur}
                className={fieldClass("maxPremiumPctScaled")}
              />
            </FormField>
          </div>
        </div>
      </section>

      {/* ── Images ────────────────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <ImageIcon className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Event Images</h2>
          <span className="ml-auto text-xs text-zinc-500">URLs only · First image is the cover</span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addImage(); }
              }}
              placeholder="https://example.com/my-event-cover.jpg"
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 rounded-lg bg-brand/15 border border-brand/30 text-brand text-sm font-semibold hover:bg-brand/25 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {(formik.values.images ?? []).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(formik.values.images ?? []).map((url, i) => (
                <div
                  key={url}
                  className="relative group rounded-xl overflow-hidden aspect-video bg-zinc-900 border border-zinc-800"
                >
                  {i === 0 && (
                    <div className="absolute top-1.5 left-1.5 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand/80 text-black">
                      COVER
                    </div>
                  )}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Tags ──────────────────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <Tag className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Tags</h2>
          <span className="ml-auto text-xs text-zinc-500">Press Enter or + to add</span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(); }
              }}
              placeholder="e.g. blockchain, web3, lagos..."
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {(formik.values.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(formik.values.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Submit row ────────────────────────────────────────────────── */}
      {submitError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Publish toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={formik.values.isPublished}
            onClick={() => formik.setFieldValue("isPublished", !formik.values.isPublished)}
            className={`relative w-11 h-6 rounded-full border transition-all cursor-pointer ${
              formik.values.isPublished
                ? "bg-brand/30 border-brand/50"
                : "bg-zinc-800 border-zinc-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm transition-all duration-200 ${
                formik.values.isPublished ? "translate-x-5 bg-brand" : "bg-zinc-500"
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
            {formik.values.isPublished ? (
              <>
                <Globe className="w-4 h-4 text-emerald-400" />
                Published — visible to everyone
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-zinc-500" />
                Draft — not publicly visible
              </>
            )}
          </div>
        </label>

        <div className="flex gap-3 sm:ml-auto w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none cursor-pointer"
            onClick={() => router.push("/dashboard/events")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            disabled={formik.isSubmitting}
            className="flex-1 sm:flex-none gap-2 cursor-pointer"
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? "Saving..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

// ── Reusable Field Wrapper ────────────────────────────────────────────────────
const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, error, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="block text-xs font-semibold text-zinc-300">
        {label}
        {required && <span className="text-brand ml-0.5">*</span>}
      </label>
      {hint && !error && (
        <span className="text-[11px] text-zinc-600">{hint}</span>
      )}
    </div>
    {children}
    {error && (
      <p className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium mt-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);
