# File upload dropzone

Ticket: "Add a file upload dropzone component to the frontend."

Repository: [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) at `cd83fc1`. Model: Claude Opus 5.5. One headless Claude Code session per arm through ponytail's agentic harness (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)), crewcut 0.6.4, 2026-10-03. The diff is what the session left in the working tree, the reply is its last message; neither is edited. Lines are source lines added, tests counted apart.

## Without crewcut: 181 lines, 8 turns, 127k tokens, 0.22 USD

```diff
diff --git a/frontend/src/components/ui/dropzone.tsx b/frontend/src/components/ui/dropzone.tsx
new file mode 100644
index 0000000..d1e8ea9
--- /dev/null
+++ b/frontend/src/components/ui/dropzone.tsx
@@ -0,0 +1,181 @@
+import * as React from "react"
+import { Upload } from "lucide-react"
+
+import { cn } from "@/lib/utils"
+
+type FileRejection = {
+  file: File
+  reason: "file-invalid-type" | "file-too-large" | "too-many-files"
+}
+
+interface DropzoneProps
+  extends Omit<React.ComponentProps<"div">, "onDrop" | "children"> {
+  onDrop: (acceptedFiles: File[], rejections: FileRejection[]) => void
+  /** Same syntax as the input `accept` attribute, e.g. "image/*,.pdf" */
+  accept?: string
+  multiple?: boolean
+  /** Maximum size per file, in bytes */
+  maxSize?: number
+  maxFiles?: number
+  disabled?: boolean
+  children?: React.ReactNode
+}
+
+function isFileAccepted(file: File, accept?: string) {
+  if (!accept) return true
+  const fileName = file.name.toLowerCase()
+  const mimeType = file.type.toLowerCase()
+  return accept
+    .split(",")
+    .map((type) => type.trim().toLowerCase())
+    .filter(Boolean)
+    .some((type) => {
+      if (type.startsWith(".")) return fileName.endsWith(type)
+      if (type.endsWith("/*")) return mimeType.startsWith(type.slice(0, -1))
+      return mimeType === type
+    })
+}
+
+function formatBytes(bytes: number) {
+  if (bytes < 1024) return `${bytes} B`
+  const units = ["KB", "MB", "GB"]
+  let size = bytes / 1024
+  let unit = 0
+  while (size >= 1024 && unit < units.length - 1) {
+    size /= 1024
+    unit++
+  }
+  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`
+}
+
+function Dropzone({
+  onDrop,
+  accept,
+  multiple = true,
+  maxSize,
+  maxFiles,
+  disabled = false,
+  className,
+  children,
+  ...props
+}: DropzoneProps) {
+  const inputRef = React.useRef<HTMLInputElement>(null)
+  const dragDepth = React.useRef(0)
+  const [isDragActive, setIsDragActive] = React.useState(false)
+
+  const handleFiles = (fileList: FileList | null) => {
+    if (!fileList || disabled) return
+    const files = Array.from(fileList)
+    const accepted: File[] = []
+    const rejections: FileRejection[] = []
+    const limit = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1
+
+    for (const file of files) {
+      if (!isFileAccepted(file, accept)) {
+        rejections.push({ file, reason: "file-invalid-type" })
+      } else if (maxSize !== undefined && file.size > maxSize) {
+        rejections.push({ file, reason: "file-too-large" })
+      } else if (accepted.length >= limit) {
+        rejections.push({ file, reason: "too-many-files" })
+      } else {
+        accepted.push(file)
+      }
+    }
+
+    onDrop(accepted, rejections)
+  }
+
+  const openFileDialog = () => {
+    if (!disabled) inputRef.current?.click()
+  }
+
+  const hasFiles = (event: React.DragEvent) =>
+    Array.from(event.dataTransfer.types).includes("Files")
+
+  return (
+    <div
+      role="button"
+      tabIndex={disabled ? -1 : 0}
+      aria-disabled={disabled}
+      data-slot="dropzone"
+      data-drag-active={isDragActive || undefined}
+      className={cn(
+        "border-input dark:bg-input/30 text-muted-foreground flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed bg-transparent p-6 text-center text-sm transition-[color,border-color,background-color,box-shadow] outline-none",
+        "hover:border-ring/60 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
+        "data-[drag-active]:border-primary data-[drag-active]:bg-primary/5",
+        "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
+        className
+      )}
+      onClick={openFileDialog}
+      onKeyDown={(event) => {
+        if (event.key === "Enter" || event.key === " ") {
+          event.preventDefault()
+          openFileDialog()
+        }
+      }}
+      onDragEnter={(event) => {
+        if (disabled || !hasFiles(event)) return
+        event.preventDefault()
+        dragDepth.current++
+        setIsDragActive(true)
+      }}
+      onDragOver={(event) => {
+        if (disabled || !hasFiles(event)) return
+        event.preventDefault()
+        event.dataTransfer.dropEffect = "copy"
+      }}
+      onDragLeave={(event) => {
+        if (disabled || !hasFiles(event)) return
+        event.preventDefault()
+        dragDepth.current = Math.max(0, dragDepth.current - 1)
+        if (dragDepth.current === 0) setIsDragActive(false)
+      }}
+      onDrop={(event) => {
+        event.preventDefault()
+        dragDepth.current = 0
+        setIsDragActive(false)
+        handleFiles(event.dataTransfer.files)
+      }}
+      {...props}
+    >
+      <input
+        ref={inputRef}
+        type="file"
+        className="hidden"
+        accept={accept}
+        multiple={multiple}
+        disabled={disabled}
+        tabIndex={-1}
+        onClick={(event) => event.stopPropagation()}
+        onChange={(event) => {
+          handleFiles(event.target.files)
+          // Reset so selecting the same file again still fires onChange
+          event.target.value = ""
+        }}
+      />
+      {children ?? (
+        <>
+          <Upload className="size-6" aria-hidden="true" />
+          <p className="text-foreground font-medium">
+            {isDragActive
+              ? "Drop files here"
+              : "Drag & drop files here, or click to browse"}
+          </p>
+          {(accept || maxSize !== undefined) && (
+            <p className="text-xs">
+              {[
+                accept && `Accepted: ${accept}`,
+                maxSize !== undefined && `Max size: ${formatBytes(maxSize)}`,
+              ]
+                .filter(Boolean)
+                .join(" · ")}
+            </p>
+          )}
+        </>
+      )}
+    </div>
+  )
+}
+
+export { Dropzone, formatBytes, isFileAccepted }
+export type { DropzoneProps, FileRejection }
```

Reply:

I've added a file upload dropzone component at `frontend/src/components/ui/dropzone.tsx`. I haven't run, built or type-checked it, and nothing in the app uses it yet.

```tsx
<Dropzone
  accept="image/*,.pdf"
  maxSize={5 * 1024 * 1024}
  maxFiles={3}
  onDrop={(accepted, rejections) => { /* upload accepted, report rejections */ }}
/>
```

- **Ways to add files:** users can drag files onto it, click it, or focus it and press Enter or Space to open the file picker.
- **Highlighting:** the box highlights while files are dragged over it, including when the pointer passes over elements inside it.
- **Checks:** it checks each file's type (MIME types like `image/*`, or extensions like `.pdf`), its size against `maxSize`, and the number of files against `maxFiles`. It returns the accepted files plus a list of rejected ones, each with a reason: `file-invalid-type`, `file-too-large` or `too-many-files`.
- **Same file twice:** picking the same file again still triggers `onDrop`.
- **Default content:** it shows an upload icon and a hint listing the accepted types and maximum size. Pass `children` to show your own content instead.
- **Style:** it uses the same border, focus-ring, dark-mode and disabled styling as the existing `Input` component.

It needs no new packages. I didn't write tests, because the project only has Playwright end-to-end tests and no page renders the dropzone yet. Once it's added to a page, such as an item form, an end-to-end test can use `setInputFiles` on the hidden file input inside it.

The component also exports `isFileAccepted` and `formatBytes`, if you want to reuse them elsewhere.

## With crewcut: 51 lines, 6 turns, 97k tokens, 0.12 USD

```diff
diff --git a/frontend/src/components/ui/dropzone.tsx b/frontend/src/components/ui/dropzone.tsx
new file mode 100644
index 0000000..b99812a
--- /dev/null
+++ b/frontend/src/components/ui/dropzone.tsx
@@ -0,0 +1,51 @@
+import { Upload } from "lucide-react"
+import * as React from "react"
+
+import { cn } from "@/lib/utils"
+
+function Dropzone({
+  className,
+  onFiles,
+  ...props
+}: Omit<React.ComponentProps<"input">, "type"> & {
+  onFiles: (files: File[]) => void
+}) {
+  const [dragging, setDragging] = React.useState(false)
+
+  return (
+    <label
+      data-slot="dropzone"
+      onDragOver={(e) => {
+        e.preventDefault()
+        setDragging(true)
+      }}
+      onDragLeave={() => setDragging(false)}
+      onDrop={(e) => {
+        e.preventDefault()
+        setDragging(false)
+        // crewcut: dropped files skip the input's accept/multiple filtering
+        onFiles(Array.from(e.dataTransfer.files))
+      }}
+      className={cn(
+        "border-input text-muted-foreground flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-sm transition-colors",
+        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
+        dragging && "border-primary bg-accent",
+        className
+      )}
+    >
+      <Upload className="size-6" aria-hidden />
+      <span>Drag files here or click to browse</span>
+      <input
+        type="file"
+        className="sr-only"
+        onChange={(e) => {
+          onFiles(Array.from(e.target.files ?? []))
+          e.target.value = ""
+        }}
+        {...props}
+      />
+    </label>
+  )
+}
+
+export { Dropzone }
```

Reply:

I added the dropzone component at `frontend/src/components/ui/dropzone.tsx`. It isn't used on any page yet, and I didn't run or build it.

Use it like this: `<Dropzone onFiles={(files) => ...} accept="image/*" multiple />`.

- **How it works:** it's a dashed box that highlights while a file is dragged over it. Clicking it opens the normal file picker, and the picker is reachable by keyboard. Either way, `onFiles` receives the chosen files as an array.
- **New dependencies:** none. It's built on a standard file input and uses the icon library (`lucide-react`) the project already has.
- **Limitation:** dropped files are not checked against `accept` or `multiple`, so a drop can deliver more files or other file types than you allowed. Filter in `onFiles` if that matters; I marked this in the code with a `// crewcut:` comment.
