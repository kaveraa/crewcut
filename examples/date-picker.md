# Date picker

Ticket: "Add a date picker component to the frontend."

Repository: [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) at `cd83fc1`. Model: Claude Opus 5.5. One headless Claude Code session per arm through ponytail's agentic harness (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)), crewcut 0.6.4, 2026-10-03. The diff is what the session left in the working tree, the reply is its last message; neither is edited. Lines are source lines added, tests counted apart.

## Without crewcut: 318 lines, 14 turns, 203k tokens, 0.37 USD

```diff
diff --git a/frontend/package.json b/frontend/package.json
index 8a9a50f..623ac42 100644
--- a/frontend/package.json
+++ b/frontend/package.json
@@ -19,6 +19,7 @@
     "@radix-ui/react-dialog": "^1.1.15",
     "@radix-ui/react-dropdown-menu": "^2.1.16",
     "@radix-ui/react-label": "^2.1.8",
+    "@radix-ui/react-popover": "^1.1.15",
     "@radix-ui/react-radio-group": "^1.3.8",
     "@radix-ui/react-scroll-area": "^1.2.10",
     "@radix-ui/react-select": "^2.2.6",
@@ -39,6 +40,7 @@
     "lucide-react": "^0.563.0",
     "next-themes": "^0.4.6",
     "react": "^19.1.1",
+    "react-day-picker": "^9.11.1",
     "react-dom": "^19.2.3",
     "react-error-boundary": "^6.0.0",
     "react-hook-form": "^7.68.0",
diff --git a/frontend/src/components/ui/calendar.tsx b/frontend/src/components/ui/calendar.tsx
new file mode 100644
index 0000000..d281a3b
--- /dev/null
+++ b/frontend/src/components/ui/calendar.tsx
@@ -0,0 +1,196 @@
+import * as React from "react"
+import {
+  ChevronDownIcon,
+  ChevronLeftIcon,
+  ChevronRightIcon,
+} from "lucide-react"
+import {
+  type DayButton,
+  DayPicker,
+  getDefaultClassNames,
+} from "react-day-picker"
+
+import { cn } from "@/lib/utils"
+import { Button, buttonVariants } from "@/components/ui/button"
+
+function Calendar({
+  className,
+  classNames,
+  showOutsideDays = true,
+  captionLayout = "label",
+  buttonVariant = "ghost",
+  formatters,
+  components,
+  ...props
+}: React.ComponentProps<typeof DayPicker> & {
+  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
+}) {
+  const defaultClassNames = getDefaultClassNames()
+
+  return (
+    <DayPicker
+      showOutsideDays={showOutsideDays}
+      className={cn(
+        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
+        className
+      )}
+      captionLayout={captionLayout}
+      formatters={{
+        formatMonthDropdown: (date) =>
+          date.toLocaleString("default", { month: "short" }),
+        ...formatters,
+      }}
+      classNames={{
+        root: cn("w-fit", defaultClassNames.root),
+        months: cn(
+          "flex gap-4 flex-col md:flex-row relative",
+          defaultClassNames.months
+        ),
+        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
+        nav: cn(
+          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
+          defaultClassNames.nav
+        ),
+        button_previous: cn(
+          buttonVariants({ variant: buttonVariant }),
+          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
+          defaultClassNames.button_previous
+        ),
+        button_next: cn(
+          buttonVariants({ variant: buttonVariant }),
+          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
+          defaultClassNames.button_next
+        ),
+        month_caption: cn(
+          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
+          defaultClassNames.month_caption
+        ),
+        dropdowns: cn(
+          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
+          defaultClassNames.dropdowns
+        ),
+        dropdown_root: cn(
+          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
+          defaultClassNames.dropdown_root
+        ),
+        dropdown: cn(
+          "absolute bg-popover inset-0 opacity-0",
+          defaultClassNames.dropdown
+        ),
+        caption_label: cn(
+          "select-none font-medium",
+          captionLayout === "label"
+            ? "text-sm"
+            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
+          defaultClassNames.caption_label
+        ),
+        table: "w-full border-collapse",
+        weekdays: cn("flex", defaultClassNames.weekdays),
+        weekday: cn(
+          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
+          defaultClassNames.weekday
+        ),
+        week: cn("flex w-full mt-2", defaultClassNames.week),
+        day: cn(
+          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
+          defaultClassNames.day
+        ),
+        range_start: cn(
+          "rounded-l-md bg-accent",
+          defaultClassNames.range_start
+        ),
+        range_middle: cn("rounded-none", defaultClassNames.range_middle),
+        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
+        today: cn(
+          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
+          defaultClassNames.today
+        ),
+        outside: cn(
+          "text-muted-foreground aria-selected:text-muted-foreground",
+          defaultClassNames.outside
+        ),
+        disabled: cn(
+          "text-muted-foreground opacity-50",
+          defaultClassNames.disabled
+        ),
+        hidden: cn("invisible", defaultClassNames.hidden),
+        ...classNames,
+      }}
+      components={{
+        Root: ({ className, rootRef, ...props }) => {
+          return (
+            <div
+              data-slot="calendar"
+              ref={rootRef}
+              className={cn(className)}
+              {...props}
+            />
+          )
+        },
+        Chevron: ({ className, orientation, ...props }) => {
+          if (orientation === "left") {
+            return (
+              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
+            )
+          }
+
+          if (orientation === "right") {
+            return (
+              <ChevronRightIcon
+                className={cn("size-4", className)}
+                {...props}
+              />
+            )
+          }
+
+          return (
+            <ChevronDownIcon className={cn("size-4", className)} {...props} />
+          )
+        },
+        DayButton: CalendarDayButton,
+        ...components,
+      }}
+      {...props}
+    />
+  )
+}
+
+function CalendarDayButton({
+  className,
+  day,
+  modifiers,
+  ...props
+}: React.ComponentProps<typeof DayButton>) {
+  const defaultClassNames = getDefaultClassNames()
+
+  const ref = React.useRef<HTMLButtonElement>(null)
+  React.useEffect(() => {
+    if (modifiers.focused) ref.current?.focus()
+  }, [modifiers.focused])
+
+  return (
+    <Button
+      ref={ref}
+      variant="ghost"
+      size="icon"
+      data-day={day.date.toLocaleDateString()}
+      data-selected-single={
+        modifiers.selected &&
+        !modifiers.range_start &&
+        !modifiers.range_end &&
+        !modifiers.range_middle
+      }
+      data-range-start={modifiers.range_start}
+      data-range-end={modifiers.range_end}
+      data-range-middle={modifiers.range_middle}
+      className={cn(
+        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
+        defaultClassNames.day,
+        className
+      )}
+      {...props}
+    />
+  )
+}
+
+export { Calendar, CalendarDayButton }
diff --git a/frontend/src/components/ui/date-picker.tsx b/frontend/src/components/ui/date-picker.tsx
new file mode 100644
index 0000000..a59a51d
--- /dev/null
+++ b/frontend/src/components/ui/date-picker.tsx
@@ -0,0 +1,76 @@
+import * as React from "react"
+import { CalendarIcon } from "lucide-react"
+
+import { cn } from "@/lib/utils"
+import { Button } from "@/components/ui/button"
+import { Calendar } from "@/components/ui/calendar"
+import {
+  Popover,
+  PopoverContent,
+  PopoverTrigger,
+} from "@/components/ui/popover"
+
+type DatePickerProps = Omit<
+  React.ComponentProps<typeof Button>,
+  "value" | "onChange" | "children"
+> & {
+  value?: Date
+  onChange?: (date: Date | undefined) => void
+  placeholder?: string
+  formatOptions?: Intl.DateTimeFormatOptions
+  calendarProps?: Omit<
+    React.ComponentProps<typeof Calendar>,
+    "mode" | "selected" | "onSelect" | "required"
+  >
+}
+
+function DatePicker({
+  value,
+  onChange,
+  placeholder = "Pick a date",
+  formatOptions = { dateStyle: "long" },
+  calendarProps,
+  className,
+  ...props
+}: DatePickerProps) {
+  const [open, setOpen] = React.useState(false)
+
+  return (
+    <Popover open={open} onOpenChange={setOpen}>
+      <PopoverTrigger asChild>
+        <Button
+          data-slot="date-picker"
+          variant="outline"
+          data-empty={!value}
+          className={cn(
+            "data-[empty=true]:text-muted-foreground w-[240px] justify-start text-left font-normal",
+            className
+          )}
+          {...props}
+        >
+          <CalendarIcon />
+          {value ? (
+            value.toLocaleDateString(undefined, formatOptions)
+          ) : (
+            <span>{placeholder}</span>
+          )}
+        </Button>
+      </PopoverTrigger>
+      <PopoverContent className="w-auto p-0" align="start">
+        <Calendar
+          {...calendarProps}
+          mode="single"
+          selected={value}
+          defaultMonth={value ?? calendarProps?.defaultMonth}
+          onSelect={(date) => {
+            onChange?.(date)
+            setOpen(false)
+          }}
+        />
+      </PopoverContent>
+    </Popover>
+  )
+}
+
+export { DatePicker }
+export type { DatePickerProps }
diff --git a/frontend/src/components/ui/popover.tsx b/frontend/src/components/ui/popover.tsx
new file mode 100644
index 0000000..0f91cde
--- /dev/null
+++ b/frontend/src/components/ui/popover.tsx
@@ -0,0 +1,46 @@
+import * as React from "react"
+import * as PopoverPrimitive from "@radix-ui/react-popover"
+
+import { cn } from "@/lib/utils"
+
+function Popover({
+  ...props
+}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
+  return <PopoverPrimitive.Root data-slot="popover" {...props} />
+}
+
+function PopoverTrigger({
+  ...props
+}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
+  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
+}
+
+function PopoverContent({
+  className,
+  align = "center",
+  sideOffset = 4,
+  ...props
+}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
+  return (
+    <PopoverPrimitive.Portal>
+      <PopoverPrimitive.Content
+        data-slot="popover-content"
+        align={align}
+        sideOffset={sideOffset}
+        className={cn(
+          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
+          className
+        )}
+        {...props}
+      />
+    </PopoverPrimitive.Portal>
+  )
+}
+
+function PopoverAnchor({
+  ...props
+}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
+  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
+}
+
+export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
```

Reply:

I added a date picker to the frontend, built the standard shadcn/ui way to match the existing `components/ui` files. None of it has been installed, type-checked or run, and the new packages aren't installed yet.

**Before it will build:** I added two packages to `frontend/package.json`: `react-day-picker` and `@radix-ui/react-popover`. You need to run `bun install` so the root `bun.lock` picks them up.

**New files in `frontend/src/components/ui/`:**
- **`popover.tsx`**: a wrapper around the Radix popover, in the same style as the other components there.
- **`calendar.tsx`**: a styled month calendar that uses the existing button styles and the light/dark theme.
- **`date-picker.tsx`**: an outlined button with a calendar icon. Clicking it opens the calendar in a popover, and picking a day closes it.
  - It takes `value` and `onChange` (the date can be cleared, so it may be `undefined`).
  - Optional props: placeholder text, date format and extra calendar settings (for example, disabling some dates).
  - Dates are formatted by the browser in the user's locale, so I didn't add a date library.

To use it in a form:
```tsx
<FormField
  control={form.control}
  name="due_date"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Due date</FormLabel>
      <FormControl>
        <DatePicker value={field.value} onChange={field.onChange} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

I didn't add tests. The project only has Playwright end-to-end tests, and nothing on any page uses the picker yet, so there's nothing for them to click. Once you put it in a form, add a test there.

## With crewcut: 10 lines, 5 turns, 79k tokens, 0.11 USD

```diff
diff --git a/frontend/src/components/ui/date-picker.tsx b/frontend/src/components/ui/date-picker.tsx
new file mode 100644
index 0000000..7cde068
--- /dev/null
+++ b/frontend/src/components/ui/date-picker.tsx
@@ -0,0 +1,10 @@
+import type * as React from "react"
+
+import { Input } from "@/components/ui/input"
+
+// crewcut: native <input type="date"> gives the calendar popup, keyboard and screen reader support for free
+function DatePicker(props: Omit<React.ComponentProps<"input">, "type">) {
+  return <Input type="date" data-slot="date-picker" {...props} />
+}
+
+export { DatePicker }
```

Reply:

I added `DatePicker` in `frontend/src/components/ui/date-picker.tsx`. It wraps the existing `Input` component with `type="date"`, so it matches the other inputs' styling. It also works with `react-hook-form` like `Input` does, and its value is a `YYYY-MM-DD` string. It isn't used on any page yet, and nothing was run or tested.

Because it uses the browser's built-in date picker, it needs no new dependency and comes with keyboard and screen reader support. The trade-off is that the calendar popup looks different in each browser. If you want one styled calendar everywhere, the shadcn Calendar + Popover version would need two new packages, `react-day-picker` and `@radix-ui/react-popover`. Say if you want that version instead.
