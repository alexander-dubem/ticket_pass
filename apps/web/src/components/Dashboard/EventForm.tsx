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
  Plus,
  X,
  Globe,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Spinner } from "../ui/spinner";
import { DateTimePicker } from "../ui/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
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
    .string("Please enter an event name")
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name must be under 100 characters"),
  description: z
    .string("Please enter a description")
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long"),
  date: z
    .string("Please choose a start date & time")
    .min(1, "Start date & time is required"),
  endDate: z.string("Please choose a valid end date & time").optional(),
  location: z
    .string("Please enter the venue or location")
    .min(2, "Location is required"),
  price: z.preprocess(
    (v) => (v === undefined || v === null ? "" : v),
    z
      .string("Please enter a price")
      .min(1, "Price is required")
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number")
  ),
  capacity: z
    .number({ message: "Capacity must be a valid number" })
    .int("Must be a whole number")
    .min(1, "At least 1 seat required")
    .max(1000000, "Capacity is too large"),
  maxPremiumPctScaled: z
    .number({ message: "Must be a valid number" })
    .min(0, "Cannot be negative")
    .max(5000, "Max 500%"),
  images: z
    .array(z.string("Each image must be a valid URL").url("Each image must be a valid URL"))
    .optional(),
  instructions: z
    .string("Please enter the entry instructions")
    .max(2000, "Instructions too long")
    .optional(),
  category: z.string("Please pick a category").optional(),
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

  // ── Field validation helpers
  const hasError = (name: keyof EventFormValues) =>
    formik.touched[name] && !!formik.errors[name];
  const invalid = (name: keyof EventFormValues) =>
    hasError(name) ? true : undefined;

  return (
    <form onSubmit={formik.handleSubmit} noValidate className="space-y-6 max-w-2xl">

      {/* ── Basic Information ─────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <FileText className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Basic Information</h2>
        </div>

        <FieldGroup className="p-6">
          {/* Title */}
          <Field data-invalid={hasError("title")}>
            <FieldLabel htmlFor="title">
              Event Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Neon Bloom Festival Lagos"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={invalid("title")}
              className="h-10 rounded-lg"
            />
            <FieldError>{hasError("title") ? formik.errors.title : undefined}</FieldError>
          </Field>

          {/* Description */}
          <Field data-invalid={hasError("description")}>
            <FieldLabel htmlFor="description">
              Description <span className="text-destructive">*</span>
            </FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe your event — what to expect, who it's for, agenda highlights..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-invalid={invalid("description")}
              className="rounded-lg"
            />
            <FieldDescription>
              {`${formik.values.description.length}/5000`}
            </FieldDescription>
            <FieldError>
              {hasError("description") ? formik.errors.description : undefined}
            </FieldError>
          </Field>

          {/* Category */}
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Select
              value={formik.values.category || null}
              onValueChange={(value: string | null) =>
                formik.setFieldValue("category", value ?? "")
              }
            >
              <SelectTrigger id="category" className="w-full h-10 rounded-lg">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Instructions */}
          <Field>
            <FieldLabel htmlFor="instructions">Entry Instructions</FieldLabel>
            <Textarea
              id="instructions"
              name="instructions"
              rows={3}
              placeholder="e.g. Bring a valid photo ID. Smart casual dress code. Doors open 30 minutes before start."
              value={formik.values.instructions}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="rounded-lg"
            />
            <FieldDescription>Dress code, ID requirements, gate info, etc.</FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Date & Location ───────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <CalendarDays className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Date & Location</h2>
        </div>

        <FieldGroup className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field data-invalid={hasError("date")}>
              <FieldLabel htmlFor="date">
                Start Date & Time <span className="text-destructive">*</span>
              </FieldLabel>
              <DateTimePicker
                id="date"
                value={formik.values.date || undefined}
                onValueChange={(iso) => formik.setFieldValue("date", iso)}
                placeholder="Pick a start date & time"
              />
              <FieldError>{hasError("date") ? formik.errors.date : undefined}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="endDate">End Date & Time</FieldLabel>
              <DateTimePicker
                id="endDate"
                value={formik.values.endDate || undefined}
                onValueChange={(iso) => formik.setFieldValue("endDate", iso)}
                placeholder="Pick an end date & time"
              />
              <FieldDescription>Optional</FieldDescription>
            </Field>
          </div>

          <Field data-invalid={hasError("location")}>
            <FieldLabel htmlFor="location">
              Venue / Location <span className="text-destructive">*</span>
            </FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon align="inline-start">
                <MapPin className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Eko Hotel, Lagos  —  or  Virtual"
                value={formik.values.location}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                aria-invalid={invalid("location")}
              />
            </InputGroup>
            <FieldError>{hasError("location") ? formik.errors.location : undefined}</FieldError>
          </Field>
        </FieldGroup>
      </section>

      {/* ── Ticketing ─────────────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <DollarSign className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Ticketing</h2>
        </div>

        <FieldGroup className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field data-invalid={hasError("price")}>
              <FieldLabel htmlFor="price">
                Price (XLM) <span className="text-destructive">*</span>
              </FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start">
                  <DollarSign className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0.00"
                  value={formik.values.price}
                  onChange={(e) => formik.setFieldValue("price", e.target.value)}
                  onBlur={formik.handleBlur}
                  aria-invalid={invalid("price")}
                />
              </InputGroup>
              <FieldError>{hasError("price") ? formik.errors.price : undefined}</FieldError>
            </Field>

            <Field data-invalid={hasError("capacity")}>
              <FieldLabel htmlFor="capacity">
                Total Seats <span className="text-destructive">*</span>
              </FieldLabel>
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start">
                  <Users className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
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
                  aria-invalid={invalid("capacity")}
                />
              </InputGroup>
              <FieldError>{hasError("capacity") ? formik.errors.capacity : undefined}</FieldError>
            </Field>

            <Field data-invalid={hasError("maxPremiumPctScaled")}>
              <FieldLabel htmlFor="maxPremiumPctScaled">Max Resale Premium (%)</FieldLabel>
              <Input
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
                aria-invalid={invalid("maxPremiumPctScaled")}
                className="h-10 rounded-lg"
              />
              <FieldDescription>Anti-scalp cap (e.g. 15%)</FieldDescription>
              <FieldError>
                {hasError("maxPremiumPctScaled") ? formik.errors.maxPremiumPctScaled : undefined}
              </FieldError>
            </Field>
          </div>
        </FieldGroup>
      </section>

      {/* ── Images ────────────────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <ImageIcon className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Event Images</h2>
          <span className="ml-auto text-xs text-zinc-500">URLs only · First image is the cover</span>
        </div>

        <FieldGroup className="p-6">
          <InputGroup className="h-10">
            <InputGroupInput
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addImage(); }
              }}
              placeholder="https://example.com/my-event-cover.jpg"
            />
            <InputGroupButton onClick={addImage} aria-label="Add image">
              <Plus className="size-4" />
            </InputGroupButton>
          </InputGroup>

          {(formik.values.images ?? []).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(formik.values.images ?? []).map((url, i) => (
                <div
                  key={url}
                  className="relative group rounded-xl overflow-hidden aspect-video bg-zinc-900 border border-zinc-800"
                >
                  {i === 0 && (
                    <Badge className="absolute top-1.5 left-1.5 z-10 text-[9px] font-bold px-1.5 py-0.5 bg-brand/80 text-black border-transparent">
                      COVER
                    </Badge>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="absolute top-1.5 right-1.5 size-5 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </FieldGroup>
      </section>

      {/* ── Tags ──────────────────────────────────────────────────────── */}
      <section className="glass rounded-2xl border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-zinc-900/40">
          <Tag className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Tags</h2>
          <span className="ml-auto text-xs text-zinc-500">Press Enter or + to add</span>
        </div>

        <FieldGroup className="p-6">
          <InputGroup className="h-10">
            <InputGroupInput
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(); }
              }}
              placeholder="e.g. blockchain, web3, lagos..."
            />
            <InputGroupButton onClick={addTag} aria-label="Add tag">
              <Plus className="size-4" />
            </InputGroupButton>
          </InputGroup>

          {(formik.values.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(formik.values.tags ?? []).map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1.5 px-3 py-1 pr-1.5">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                    className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </FieldGroup>
      </section>

      {/* ── Submit row ────────────────────────────────────────────────── */}
      {submitError && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="size-4" />
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Publish toggle */}
        <div className="flex items-center gap-3">
          <Switch
            id="isPublished"
            checked={formik.values.isPublished}
            onCheckedChange={(checked) => formik.setFieldValue("isPublished", checked)}
          />
          <label htmlFor="isPublished" className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 cursor-pointer select-none">
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
          </label>
        </div>

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
                <Spinner className="size-4" />
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
