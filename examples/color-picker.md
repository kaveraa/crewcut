# Color picker

Ticket: "Add a color picker component to the frontend."

Repository: [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) at `cd83fc1`. Model: Claude Opus 5.5. One headless Claude Code session per arm through ponytail's agentic harness, unchanged, crewcut 0.15.4, 2026-11-13 (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)). The diff is what the session left behind, the reply is its last message; neither is edited.

## Without crewcut: 121 lines, 7 turns, 105k tokens, 0.16 USD

```diff
diff --git a/frontend/src/components/ui/color-picker.tsx b/frontend/src/components/ui/color-picker.tsx
new file mode 100644
index 0000000..34b8e93
--- /dev/null
+++ b/frontend/src/components/ui/color-picker.tsx
@@ -0,0 +1,121 @@
+import * as React from "react"
+
+import { cn } from "@/lib/utils"
+import { Input } from "./input"
+
+const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
+
+/** Returns a lowercase `#rrggbb` string, or null if `input` isn't a valid hex color. */
+function normalizeHex(input: string): string | null {
+  const match = HEX_RE.exec(input.trim())
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
+interface ColorPickerProps {
+  value: string
+  onChange: (value: string) => void
+  /** Optional preset swatches shown below the inputs. */
+  presets?: string[]
+  id?: string
+  disabled?: boolean
+  className?: string
+  "aria-invalid"?: boolean
+}
+
+function ColorPicker({
+  value,
+  onChange,
+  presets,
+  id,
+  disabled,
+  className,
+  "aria-invalid": ariaInvalid,
+}: ColorPickerProps) {
+  const color = normalizeHex(value) ?? "#000000"
+  const [draft, setDraft] = React.useState(color)
+
+  // Keep the text field in sync when the value changes from outside.
+  React.useEffect(() => {
+    setDraft(color)
+  }, [color])
+
+  const commitDraft = () => {
+    const next = normalizeHex(draft)
+    if (next) {
+      setDraft(next)
+      if (next !== color) onChange(next)
+    } else {
+      setDraft(color)
+    }
+  }
+
+  return (
+    <div data-slot="color-picker" className={cn("space-y-2", className)}>
+      <div className="flex items-center gap-2">
+        <input
+          type="color"
+          aria-label="Pick a color"
+          value={color}
+          disabled={disabled}
+          onChange={(e) => onChange(e.target.value.toLowerCase())}
+          className="border-input h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1 shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
+        />
+        <Input
+          id={id}
+          value={draft}
+          disabled={disabled}
+          maxLength={7}
+          spellCheck={false}
+          autoComplete="off"
+          aria-label="Hex color"
+          aria-invalid={ariaInvalid || normalizeHex(draft) === null}
+          onChange={(e) => setDraft(e.target.value)}
+          onBlur={commitDraft}
+          onKeyDown={(e) => {
+            if (e.key === "Enter") {
+              e.preventDefault()
+              commitDraft()
+            }
+          }}
+          className="font-mono"
+        />
+      </div>
+      {presets && presets.length > 0 && (
+        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Preset colors">
+          {presets.map((preset) => {
+            const presetHex = normalizeHex(preset)
+            if (!presetHex) return null
+            const selected = presetHex === color
+            return (
+              <button
+                key={presetHex}
+                type="button"
+                disabled={disabled}
+                title={presetHex}
+                aria-label={`Select ${presetHex}`}
+                aria-pressed={selected}
+                onClick={() => onChange(presetHex)}
+                style={{ backgroundColor: presetHex }}
+                className={cn(
+                  "size-6 rounded-md border border-black/10 shadow-xs outline-none transition-transform hover:scale-110 focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 dark:border-white/20",
+                  selected && "ring-ring ring-2 ring-offset-2 ring-offset-background"
+                )}
+              />
+            )
+          })}
+        </div>
+      )}
+    </div>
+  )
+}
+
+export { ColorPicker, normalizeHex }
+export type { ColorPickerProps }
```

Reply:

I added a color picker component in `frontend/src/components/ui/color-picker.tsx`. Nothing uses it yet, and I haven't type-checked, run or tested it.

It's a controlled component, like the project's other UI components. You pass in the current color and get each new color back through `onChange`. The values it hands back are always lowercase `#rrggbb`. It has three parts:

- **Color swatch:** the browser's built-in color picker, so I didn't need to add any dependencies.
- **Hex text field:** accepts `#rgb` or `#rrggbb`, with or without the `#`. It applies the color when you press Enter or click away. Invalid text is flagged while you type and goes back to the last good color on blur.
- **Optional preset swatches:** pass a `presets` list and a row of clickable swatches appears, with the current one highlighted.

It also supports `id`, `disabled`, `className` and `aria-invalid`, so it can sit inside the existing forms. A small `normalizeHex` helper is exported too.

```tsx
import { ColorPicker } from "@/components/ui/color-picker"

const [color, setColor] = useState("#3b82f6")
<ColorPicker value={color} onChange={setColor} presets={["#ef4444", "#22c55e", "#3b82f6"]} />
```

The swatch opens the browser's own picker instead of a styled popup like the other menus. A styled popup would need a new popover package, which I couldn't install here. I didn't write tests: the project only has end-to-end tests, and no page shows the picker yet to test against.

## With crewcut: 21 lines, 4 turns, 80k tokens, 0.09 USD

```diff
diff --git a/frontend/src/components/ui/color-picker.tsx b/frontend/src/components/ui/color-picker.tsx
new file mode 100644
index 0000000..0395fdd
--- /dev/null
+++ b/frontend/src/components/ui/color-picker.tsx
@@ -0,0 +1,21 @@
+import type * as React from "react"
+
+import { cn } from "@/lib/utils"
+
+// Native color input: free keyboard, screen reader and eyedropper support.
+function ColorPicker({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
+  return (
+    <input
+      type="color"
+      data-slot="color-picker"
+      className={cn(
+        "border-input h-9 w-14 cursor-pointer rounded-md border bg-transparent p-1 shadow-xs outline-none",
+        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
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

I added a `ColorPicker` component in `frontend/src/components/ui/color-picker.tsx`. It wraps the browser's built-in color input and uses the same border and focus styles as the existing `Input`. It takes the normal input props (`value`, `onChange`, `id`, `aria-label`), so pair it with a `Label` or pass `aria-label` so screen readers can name it. It isn't used on any page yet, and I didn't build or test it.
