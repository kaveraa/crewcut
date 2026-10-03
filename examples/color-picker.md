# Color picker

Ticket: "Add a color picker component to the frontend."

Repository: [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) at `cd83fc1`. Model: Claude Opus 5.5. One headless Claude Code session per arm through ponytail's agentic harness (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)), crewcut 0.6.4, 2026-10-03. The diff is what the session left in the working tree, the reply is its last message; neither is edited. Lines are source lines added, tests counted apart.

## Without crewcut: 182 lines, 7 turns, 105k tokens, 0.20 USD

```diff
diff --git a/frontend/src/components/ui/color-picker.tsx b/frontend/src/components/ui/color-picker.tsx
new file mode 100644
index 0000000..cbcce8f
--- /dev/null
+++ b/frontend/src/components/ui/color-picker.tsx
@@ -0,0 +1,182 @@
+import * as React from "react"
+import { Check } from "lucide-react"
+
+import { cn } from "@/lib/utils"
+import { Input } from "./input"
+
+const DEFAULT_PRESETS = [
+  "#ef4444",
+  "#f97316",
+  "#eab308",
+  "#22c55e",
+  "#06b6d4",
+  "#3b82f6",
+  "#8b5cf6",
+  "#ec4899",
+  "#64748b",
+  "#000000",
+]
+
+const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
+
+/** Normalizes "#abc", "abc", "#AABBCC" to "#aabbcc". Returns null if invalid. */
+function normalizeHex(input: string): string | null {
+  const match = HEX_PATTERN.exec(input.trim())
+  if (!match) return null
+  let hex = match[1].toLowerCase()
+  if (hex.length === 3) {
+    hex = hex
+      .split("")
+      .map((c) => c + c)
+      .join("")
+  }
+  return `#${hex}`
+}
+
+interface ColorPickerProps
+  extends Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> {
+  value?: string
+  defaultValue?: string
+  onChange?: (value: string) => void
+  presets?: string[]
+  disabled?: boolean
+  name?: string
+  inputId?: string
+}
+
+function ColorPicker({
+  value,
+  defaultValue = "#000000",
+  onChange,
+  presets = DEFAULT_PRESETS,
+  disabled,
+  name,
+  inputId,
+  className,
+  ...props
+}: ColorPickerProps) {
+  const isControlled = value !== undefined
+  const [internalValue, setInternalValue] = React.useState(
+    () => normalizeHex(defaultValue) ?? "#000000",
+  )
+  const color = isControlled
+    ? (normalizeHex(value) ?? "#000000")
+    : internalValue
+  const [draft, setDraft] = React.useState(color)
+
+  React.useEffect(() => {
+    setDraft(color)
+  }, [color])
+
+  const commit = (next: string) => {
+    const normalized = normalizeHex(next)
+    if (!normalized) return
+    if (!isControlled) setInternalValue(normalized)
+    setDraft(normalized)
+    if (normalized !== color) onChange?.(normalized)
+  }
+
+  const draftIsValid = normalizeHex(draft) !== null
+
+  return (
+    <div
+      data-slot="color-picker"
+      className={cn("flex flex-col gap-2", className)}
+      {...props}
+    >
+      <div className="flex items-center gap-2">
+        <input
+          type="color"
+          aria-label="Pick a color"
+          data-testid="color-picker-swatch"
+          value={color}
+          disabled={disabled}
+          onChange={(e) => commit(e.target.value)}
+          className="border-input size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-1 shadow-xs disabled:cursor-not-allowed disabled:opacity-50 [&::-moz-color-swatch]:rounded-sm [&::-moz-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
+        />
+        <Input
+          id={inputId}
+          name={name}
+          aria-label="Hex color"
+          data-testid="color-picker-input"
+          value={draft}
+          disabled={disabled}
+          maxLength={7}
+          spellCheck={false}
+          autoComplete="off"
+          aria-invalid={!draftIsValid}
+          className="font-mono uppercase"
+          onChange={(e) => {
+            setDraft(e.target.value)
+            // Commit full 6-digit hex values immediately while typing;
+            // shorthand values are committed on blur / Enter.
+            if (/^#?[0-9a-f]{6}$/i.test(e.target.value.trim())) {
+              commit(e.target.value)
+            }
+          }}
+          onBlur={() => {
+            if (draftIsValid) commit(draft)
+            else setDraft(color)
+          }}
+          onKeyDown={(e) => {
+            if (e.key === "Enter") {
+              e.preventDefault()
+              commit(draft)
+            } else if (e.key === "Escape") {
+              setDraft(color)
+            }
+          }}
+        />
+      </div>
+      {presets.length > 0 && (
+        <div
+          role="radiogroup"
+          aria-label="Preset colors"
+          className="flex flex-wrap gap-1.5"
+        >
+          {presets.map((preset) => {
+            const normalized = normalizeHex(preset)
+            if (!normalized) return null
+            const selected = normalized === color
+            return (
+              <button
+                key={normalized}
+                type="button"
+                role="radio"
+                aria-checked={selected}
+                aria-label={normalized}
+                title={normalized}
+                disabled={disabled}
+                onClick={() => commit(normalized)}
+                style={{ backgroundColor: normalized }}
+                className={cn(
+                  "border-input flex size-6 items-center justify-center rounded-md border shadow-xs transition-[box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50",
+                  "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
+                  selected && "ring-ring ring-2 ring-offset-1 ring-offset-background",
+                )}
+              >
+                {selected && (
+                  <Check
+                    className="size-3.5"
+                    style={{ color: getContrastColor(normalized) }}
+                  />
+                )}
+              </button>
+            )
+          })}
+        </div>
+      )}
+    </div>
+  )
+}
+
+/** Picks black or white text for legibility on the given hex background. */
+function getContrastColor(hex: string): string {
+  const r = Number.parseInt(hex.slice(1, 3), 16)
+  const g = Number.parseInt(hex.slice(3, 5), 16)
+  const b = Number.parseInt(hex.slice(5, 7), 16)
+  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
+  return luminance > 0.6 ? "#000000" : "#ffffff"
+}
+
+export { ColorPicker, normalizeHex, type ColorPickerProps }
```

Reply:

I added a reusable `ColorPicker` component in `frontend/src/components/ui/color-picker.tsx`. I haven't run, built or type-checked it, and there are no tests for it. It isn't used on any page yet.

**What it does:**
- **Colour square:** clicking it opens the browser's built-in colour picker. I used that instead of a dropdown because the project has no popover library and I didn't install anything.
- **Hex field:** you can type a colour code like `#3b82f6`, `3b82f6` or the short form `#abc`.
  - A full six-digit code is applied as you type. A short code is applied when you press Enter or click away.
  - Escape, or clicking away with an invalid code, puts the field back to the current colour. An invalid code also gives the field a red error border.
- **Preset colours:** a row of colour buttons, with a tick on the selected one. You can pass your own list with `presets`, or `[]` to hide the row. The tick turns black or white depending on how light the colour is.
- **Value:** it works with or without the parent managing the value, and `onChange` only fires with a cleaned-up lowercase code like `#aabbcc`. It also accepts `disabled`, `name` and `inputId` (which lets a `<label>` point to the hex field).

Usage:
```tsx
const [color, setColor] = useState("#3b82f6")
<ColorPicker value={color} onChange={setColor} />
```

**Tests:** the frontend only has Playwright end-to-end tests, which run against real pages, and there's no unit-test setup for testing a component on its own. I could put the picker on a page (for example in user settings) and add a Playwright test there if you want.

## With crewcut: 25 lines, 4 turns, 75k tokens, 0.10 USD

```diff
diff --git a/frontend/src/components/ui/color-picker.tsx b/frontend/src/components/ui/color-picker.tsx
new file mode 100644
index 0000000..2c49979
--- /dev/null
+++ b/frontend/src/components/ui/color-picker.tsx
@@ -0,0 +1,25 @@
+import type * as React from "react"
+
+import { cn } from "@/lib/utils"
+
+// crewcut: native <input type="color"> gives the picker UI, keyboard access and hex value for free
+function ColorPicker({
+  className,
+  ...props
+}: Omit<React.ComponentProps<"input">, "type">) {
+  return (
+    <input
+      type="color"
+      data-slot="color-picker"
+      className={cn(
+        "border-input dark:bg-input/30 h-9 w-14 cursor-pointer rounded-md border bg-transparent p-1 shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50",
+        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
+        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
+        className
+      )}
+      {...props}
+    />
+  )
+}
+
+export { ColorPicker }
```

Reply:

I added a `ColorPicker` component in `frontend/src/components/ui/color-picker.tsx`. It is the browser's built-in color input, styled like the existing `Input` component, so you get the picker, keyboard use and a hex value (like `#ff0000`) without a new dependency. You use it like any input (`value`, `onChange`, or spread from a react-hook-form field). Nothing was run.

Since you didn't say where it should go, it isn't used on any page yet. If you need preset swatches, transparency or a custom picker panel, that would need a bigger custom component; tell me which one you want.
