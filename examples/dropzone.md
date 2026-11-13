# File upload dropzone

Ticket: "Add a file upload dropzone component to the frontend."

Repository: [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) at `cd83fc1`. Model: Claude Opus 5.5. One headless Claude Code session per arm through ponytail's agentic harness, unchanged, crewcut 0.15.4, 2026-11-13 (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)). The diff is what the session left behind, the reply is its last message; neither is edited.

## Without crewcut: 335 lines, 6 turns, 112k tokens, 0.25 USD

```diff
diff --git a/frontend/src/components/ui/dropzone.tsx b/frontend/src/components/ui/dropzone.tsx
new file mode 100644
index 0000000..099e928
--- /dev/null
+++ b/frontend/src/components/ui/dropzone.tsx
@@ -0,0 +1,335 @@
+import { FileIcon, UploadCloud, X } from "lucide-react"
+import * as React from "react"
+
+import { Button } from "@/components/ui/button"
+import { cn } from "@/lib/utils"
+
+export interface FileRejection {
+  file: File
+  reason: string
+}
+
+export interface DropzoneProps
+  extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> {
+  /** Controlled list of files. Omit to let the component manage its own state. */
+  value?: File[]
+  /** Initial files when uncontrolled. */
+  defaultValue?: File[]
+  /** Called with the full, updated list of accepted files. */
+  onFilesChange?: (files: File[]) => void
+  /** Called with files that failed validation. */
+  onFilesRejected?: (rejections: FileRejection[]) => void
+  /** Same syntax as the `accept` attribute, e.g. "image/*,.pdf". */
+  accept?: string
+  multiple?: boolean
+  /** Maximum size per file, in bytes. */
+  maxSize?: number
+  /** Maximum total number of files (only relevant when `multiple`). */
+  maxFiles?: number
+  disabled?: boolean
+  /** Hide the list of selected files. */
+  hideFileList?: boolean
+  name?: string
+  label?: React.ReactNode
+  description?: React.ReactNode
+}
+
+export function formatBytes(bytes: number): string {
+  if (bytes === 0) return "0 B"
+  const units = ["B", "KB", "MB", "GB", "TB"]
+  const i = Math.min(
+    Math.floor(Math.log(bytes) / Math.log(1024)),
+    units.length - 1,
+  )
+  const value = bytes / 1024 ** i
+  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
+}
+
+/** Mirrors the browser's `accept` attribute matching rules. */
+export function isFileAccepted(file: File, accept?: string): boolean {
+  if (!accept) return true
+  const patterns = accept
+    .split(",")
+    .map((p) => p.trim().toLowerCase())
+    .filter(Boolean)
+  if (patterns.length === 0) return true
+
+  const fileName = file.name.toLowerCase()
+  const mimeType = (file.type || "").toLowerCase()
+  const baseMime = mimeType.replace(/\/.*$/, "")
+
+  return patterns.some((pattern) => {
+    if (pattern.startsWith(".")) return fileName.endsWith(pattern)
+    if (pattern.endsWith("/*")) return baseMime === pattern.slice(0, -2)
+    return mimeType === pattern
+  })
+}
+
+const fileKey = (file: File) =>
+  `${file.name}-${file.size}-${file.lastModified}`
+
+function Dropzone({
+  value,
+  defaultValue,
+  onFilesChange,
+  onFilesRejected,
+  accept,
+  multiple = false,
+  maxSize,
+  maxFiles,
+  disabled = false,
+  hideFileList = false,
+  name,
+  label,
+  description,
+  className,
+  id,
+  ...props
+}: DropzoneProps) {
+  const generatedId = React.useId()
+  const inputId = id ?? `dropzone-${generatedId}`
+  const descriptionId = `${inputId}-description`
+  const errorId = `${inputId}-error`
+
+  const inputRef = React.useRef<HTMLInputElement>(null)
+  const dragCounter = React.useRef(0)
+  const [isDragging, setIsDragging] = React.useState(false)
+  const [errors, setErrors] = React.useState<string[]>([])
+
+  const isControlled = value !== undefined
+  const [internalFiles, setInternalFiles] = React.useState<File[]>(
+    defaultValue ?? [],
+  )
+  const files = isControlled ? value : internalFiles
+
+  const updateFiles = (next: File[]) => {
+    if (!isControlled) setInternalFiles(next)
+    onFilesChange?.(next)
+  }
+
+  const handleFiles = (incoming: FileList | File[] | null) => {
+    if (disabled || !incoming) return
+    const list = Array.from(incoming)
+    if (list.length === 0) return
+
+    const accepted: File[] = []
+    const rejections: FileRejection[] = []
+    const existingKeys = new Set(
+      multiple ? files.map((f) => fileKey(f)) : [],
+    )
+
+    const candidates = multiple ? list : list.slice(0, 1)
+    if (!multiple && list.length > 1) {
+      for (const file of list.slice(1)) {
+        rejections.push({ file, reason: "Only one file can be uploaded" })
+      }
+    }
+
+    for (const file of candidates) {
+      if (!isFileAccepted(file, accept)) {
+        rejections.push({ file, reason: "File type not accepted" })
+        continue
+      }
+      if (maxSize !== undefined && file.size > maxSize) {
+        rejections.push({
+          file,
+          reason: `File exceeds ${formatBytes(maxSize)}`,
+        })
+        continue
+      }
+      const key = fileKey(file)
+      if (existingKeys.has(key)) continue
+      existingKeys.add(key)
+      accepted.push(file)
+    }
+
+    let next = multiple ? [...files, ...accepted] : accepted
+    if (multiple && maxFiles !== undefined && next.length > maxFiles) {
+      for (const file of next.slice(maxFiles)) {
+        rejections.push({
+          file,
+          reason: `Maximum of ${maxFiles} file${maxFiles === 1 ? "" : "s"}`,
+        })
+      }
+      next = next.slice(0, maxFiles)
+    }
+
+    setErrors(rejections.map((r) => `${r.file.name}: ${r.reason}`))
+    if (rejections.length > 0) onFilesRejected?.(rejections)
+    // In single mode a fully rejected drop keeps the current file.
+    if (multiple ? accepted.length > 0 : next.length > 0) updateFiles(next)
+  }
+
+  const removeFile = (index: number) => {
+    updateFiles(files.filter((_, i) => i !== index))
+    setErrors([])
+  }
+
+  const openFileDialog = () => {
+    if (!disabled) inputRef.current?.click()
+  }
+
+  const onDragEnter = (e: React.DragEvent) => {
+    e.preventDefault()
+    e.stopPropagation()
+    if (disabled) return
+    dragCounter.current += 1
+    if (e.dataTransfer.types.includes("Files")) setIsDragging(true)
+  }
+
+  const onDragLeave = (e: React.DragEvent) => {
+    e.preventDefault()
+    e.stopPropagation()
+    if (disabled) return
+    dragCounter.current = Math.max(0, dragCounter.current - 1)
+    if (dragCounter.current === 0) setIsDragging(false)
+  }
+
+  const onDragOver = (e: React.DragEvent) => {
+    e.preventDefault()
+    e.stopPropagation()
+    e.dataTransfer.dropEffect = disabled ? "none" : "copy"
+  }
+
+  const onDrop = (e: React.DragEvent) => {
+    e.preventDefault()
+    e.stopPropagation()
+    dragCounter.current = 0
+    setIsDragging(false)
+    handleFiles(e.dataTransfer.files)
+  }
+
+  const onKeyDown = (e: React.KeyboardEvent) => {
+    if (e.target !== e.currentTarget) return
+    if (e.key === "Enter" || e.key === " ") {
+      e.preventDefault()
+      openFileDialog()
+    }
+  }
+
+  const hasErrors = errors.length > 0
+
+  return (
+    <div
+      data-slot="dropzone"
+      className={cn("flex w-full flex-col gap-3", className)}
+      {...props}
+    >
+      {/* biome-ignore lint/a11y/useSemanticElements: a <button> cannot host drag-and-drop children cleanly */}
+      <div
+        role="button"
+        tabIndex={disabled ? -1 : 0}
+        aria-disabled={disabled}
+        aria-invalid={hasErrors || undefined}
+        aria-describedby={cn(descriptionId, hasErrors && errorId) || undefined}
+        data-dragging={isDragging || undefined}
+        data-testid="dropzone"
+        onClick={openFileDialog}
+        onKeyDown={onKeyDown}
+        onDragEnter={onDragEnter}
+        onDragLeave={onDragLeave}
+        onDragOver={onDragOver}
+        onDrop={onDrop}
+        className={cn(
+          "border-input text-muted-foreground flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center text-sm transition-[color,box-shadow,border-color,background-color] outline-none",
+          "hover:bg-accent/50 dark:bg-input/30",
+          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
+          "data-[dragging]:border-primary data-[dragging]:bg-primary/5",
+          "aria-invalid:border-destructive",
+          disabled && "pointer-events-none cursor-not-allowed opacity-50",
+        )}
+      >
+        <UploadCloud
+          aria-hidden="true"
+          className={cn("size-8", isDragging && "text-primary")}
+        />
+        <p className="text-foreground font-medium">
+          {label ??
+            (isDragging
+              ? "Drop files here"
+              : `Drag & drop ${multiple ? "files" : "a file"} here, or click to browse`)}
+        </p>
+        <p id={descriptionId} className="text-xs">
+          {description ?? buildDescription({ accept, maxSize, maxFiles, multiple })}
+        </p>
+        <input
+          ref={inputRef}
+          id={inputId}
+          name={name}
+          type="file"
+          className="sr-only"
+          tabIndex={-1}
+          accept={accept}
+          multiple={multiple}
+          disabled={disabled}
+          data-testid="dropzone-input"
+          onClick={(e) => e.stopPropagation()}
+          onChange={(e) => {
+            handleFiles(e.target.files)
+            // Reset so selecting the same file again still fires onChange.
+            e.target.value = ""
+          }}
+        />
+      </div>
+
+      {hasErrors && (
+        <ul
+          id={errorId}
+          role="alert"
+          className="text-destructive flex flex-col gap-1 text-sm"
+        >
+          {errors.map((error) => (
+            <li key={error}>{error}</li>
+          ))}
+        </ul>
+      )}
+
+      {!hideFileList && files.length > 0 && (
+        <ul className="flex flex-col gap-2" aria-label="Selected files">
+          {files.map((file, index) => (
+            <li
+              key={fileKey(file)}
+              className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
+            >
+              <FileIcon
+                aria-hidden="true"
+                className="text-muted-foreground size-4 shrink-0"
+              />
+              <span className="min-w-0 flex-1 truncate" title={file.name}>
+                {file.name}
+              </span>
+              <span className="text-muted-foreground shrink-0 text-xs">
+                {formatBytes(file.size)}
+              </span>
+              <Button
+                type="button"
+                variant="ghost"
+                size="icon-sm"
+                disabled={disabled}
+                aria-label={`Remove ${file.name}`}
+                onClick={() => removeFile(index)}
+              >
+                <X />
+              </Button>
+            </li>
+          ))}
+        </ul>
+      )}
+    </div>
+  )
+}
+
+function buildDescription({
+  accept,
+  maxSize,
+  maxFiles,
+  multiple,
+}: Pick<DropzoneProps, "accept" | "maxSize" | "maxFiles" | "multiple">) {
+  const parts: string[] = []
+  if (accept) parts.push(`Accepted: ${accept.split(",").map((s) => s.trim()).join(", ")}`)
+  if (maxSize !== undefined) parts.push(`Max ${formatBytes(maxSize)} per file`)
+  if (multiple && maxFiles !== undefined) parts.push(`Up to ${maxFiles} files`)
+  return parts.length > 0 ? parts.join(" · ") : "Any file type"
+}
+
+export { Dropzone }
```

Reply:

I've added a reusable file dropzone at `frontend/src/components/ui/dropzone.tsx`. I haven't run, built or linted it, and no page uses it yet.

It needs no new packages: it uses the browser's own drag-and-drop with a hidden file input, and it's styled like the other components in `ui/`.

**What it does:**
- **Picking files:** users can drag files onto it, click it, or focus it and press Enter or Space to open the file picker. The border is highlighted while files are dragged over it.
- **Checks:**
  - `accept` limits file types, using the same syntax as the browser's file input, e.g. `"image/*,.pdf"`.
  - `maxSize` caps the size of each file.
  - `maxFiles` caps how many files can be added; it only applies when `multiple` is on.
  - If several files are dropped while `multiple` is off, only the first is kept.
  - Duplicate files are skipped.
- **Errors:** rejected files are listed inline with the reason, and `onFilesRejected` is called with them.
- **File list:** selected files are shown with their name and size, each with a remove button. `hideFileList` turns the list off.
- **State:** it can manage its own list (optionally starting from `defaultValue`), or you can control it with `value` plus `onFilesChange`, which suits react-hook-form.
- **Text and accessibility:** `label` and `description` let you change the text. If you leave out `description`, it's built from the limits. The drop area is labelled for screen readers and is disabled properly when `disabled` is set.
- **Helpers:** it also exports `formatBytes` and `isFileAccepted` in case you want them elsewhere.

**Usage:**
```tsx
import { Dropzone } from "@/components/ui/dropzone"

<Dropzone
  accept="image/*,.pdf"
  multiple
  maxFiles={5}
  maxSize={10 * 1024 * 1024}
  onFilesChange={(files) => setFiles(files)}
/>
```

**Not included:** the component only collects files. Sending them to the backend is up to the code that uses it. I didn't add tests, because the project only has Playwright tests that run through real pages and no page uses the component yet. Once it's placed somewhere, the `dropzone` and `dropzone-input` test IDs let a test target it.

## With crewcut: 37 lines, 4 turns, 80k tokens, 0.10 USD

```diff
diff --git a/frontend/src/components/Common/Dropzone.tsx b/frontend/src/components/Common/Dropzone.tsx
new file mode 100644
index 0000000..a5520a1
--- /dev/null
+++ b/frontend/src/components/Common/Dropzone.tsx
@@ -0,0 +1,37 @@
+import { useState } from "react"
+
+import { cn } from "@/lib/utils"
+
+export function Dropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
+  const [dragging, setDragging] = useState(false)
+
+  return (
+    <label
+      onDragOver={(e) => {
+        e.preventDefault()
+        setDragging(true)
+      }}
+      onDragLeave={() => setDragging(false)}
+      onDrop={(e) => {
+        e.preventDefault()
+        setDragging(false)
+        onFiles(Array.from(e.dataTransfer.files))
+      }}
+      className={cn(
+        "flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring",
+        dragging && "border-primary bg-muted",
+      )}
+    >
+      Drop files here or click to browse
+      <input
+        type="file"
+        multiple
+        className="sr-only"
+        onChange={(e) => {
+          onFiles(Array.from(e.target.files ?? []))
+          e.target.value = ""
+        }}
+      />
+    </label>
+  )
+}
```

Reply:

I added a `Dropzone` component in `frontend/src/components/Common/Dropzone.tsx`. It takes an `onFiles(files: File[])` callback and accepts files either dropped onto it or picked by clicking. Keyboard users can also reach it, because it wraps a hidden but focusable native file input that shows a focus ring.

It isn't used on any page yet, and nothing sends the files to the backend. Uploading still needs to be wired up wherever you add it. I didn't run or test it.
