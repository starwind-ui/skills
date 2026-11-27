# Charts

`chart` is a styled component in all four frameworks. Starwind draws charts with TanStack Charts.
`npx starwind@latest add chart` installs `@tanstack/charts`. It also adds the `--chart-1` to
`--chart-5` tokens to the CSS file when they are missing. Current docs:
`https://starwind.dev/docs/components/chart.md`.

## Contents

- Parts go inside ChartContainer
- From shadcn/ui
- Chart config and colors
- Formatting in Astro
- Accessible name
- Tooltip and legend
- Next.js
- Other chart shapes
- RTL, Primitive, and Runtime

---

## Parts go inside ChartContainer

Give `ChartContainer` your `data` and a `config`. Put the parts directly inside it. The mark parts
set the chart type. `ChartBar`, `ChartLine`, and `ChartArea` can share one chart. Use `ChartPie`,
`ChartRadar`, and `ChartRadialBar` alone. A radar chart needs `ChartPolarAngleAxis`.

There is no Recharts and no chart wrapper element such as `BarChart`.

**Incorrect:** Recharts markup.

```tsx
<ChartContainer config={chartConfig}>
  <BarChart data={chartData}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickFormatter={(value) => value.slice(0, 3)} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4}>
      <LabelList position="top" />
    </Bar>
  </BarChart>
</ChartContainer>
```

**Correct:**

```tsx
<ChartContainer config={chartConfig} data={chartData} aria-label="Visitors by month">
  <ChartGrid vertical={false} />
  <ChartXAxis dataKey="month" tickFormatter={{ maxLength: 3 }} />
  <ChartBar dataKey="desktop" radius={4} label={{ position: "top" }} />
</ChartContainer>
```

Without `ChartXAxis`, the chart takes categories from the first text or date field and shows no
axis labels.

---

## From shadcn/ui

Keep the props of each part. Change the names:

| shadcn/ui                                                                        | Starwind                                                                         |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `RadarChart`, `RadialBarChart` | `ChartContainer`. The mark parts set the chart type.                             |
| `stackOffset` on the chart wrapper                                               | `stackOffset` on `ChartContainer`                                                |
| `Bar`, `Line`, `Area`, `Pie`, `Radar`, `RadialBar`                               | `ChartBar`, `ChartLine`, `ChartArea`, `ChartPie`, `ChartRadar`, `ChartRadialBar` |
| `XAxis`, `YAxis`                                                                 | `ChartXAxis`, `ChartYAxis`                                                       |
| `CartesianGrid`                                                                  | `ChartGrid`                                                                      |
| `PolarGrid`, `PolarAngleAxis`                                                    | `ChartPolarGrid`, `ChartPolarAngleAxis`                                          |
| `Label` in a pie                                                                 | One `ChartLabel position="center"` for each line of text                         |
| `LabelList` in a mark                                                            | The `label` prop of the mark                                                     |
| `linearGradient` in `defs`                                                       | `ChartLinearGradient`                                                            |
| `chartConfig[value]?.label` in a formatter                                       | `{ configLabel: true }`                                                          |
| `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`       | The same names                                                                   |

---

## Chart config and colors

The config gives each series a label and a color. Use the chart tokens. Type the config with
`satisfies ChartConfig`.

**Incorrect:** a Tailwind class as the color, and no type.

```ts
export const revenueConfig = {
  revenue: { label: "Revenue", color: "bg-blue-500" },
  costs: { label: "Costs", color: "bg-red-500" },
};
```

**Correct:**

```ts
import type { ChartConfig } from "@/components/starwind/chart";

export const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  costs: { label: "Costs", color: "var(--chart-2)" },
} satisfies ChartConfig;
```

- `ChartContainer` writes each config color to a `--color-<key>` variable inside the chart. Use it
  in your own tooltip or legend content, for example `bg-(--color-revenue)`.
- A config color can be any CSS color, such as hex or `oklch()`. Use the tokens so the chart
  follows the theme.
- Set `fill` or `stroke` on one part to give it its own color.
- Use `theme: { light, dark }` in place of `color` for one color in each mode.
- Change the chart palette in `--chart-1` to `--chart-5` in the active CSS file. See
  [customization.md](../customization.md#chart-tokens).

---

## Formatting in Astro

`tickFormatter`, `formatter`, and `labelFormatter` take a `ChartFormat` object in every framework.
React, Vue, and Svelte also take a function. In Astro, use only a format object, because a function
cannot go from the server to the browser.

`ChartFormat` fields: `maxLength`, `number` (`Intl.NumberFormatOptions`), `date`
(`Intl.DateTimeFormatOptions`), `prefix`, `suffix`, `locale`, and `configLabel`. Dates use UTC
unless `date.timeZone` sets a zone.

**Incorrect:** a function formatter in a `.astro` file.

```astro
<ChartXAxis dataKey="month" tickFormatter={(value) => value.slice(0, 3)} />
<ChartYAxis tickFormatter={(value) => `$${value}`} />
```

**Correct:**

```astro
<ChartXAxis dataKey="month" tickFormatter={{ maxLength: 3 }} />
<ChartYAxis
  tickFormatter={{ number: { style: "currency", currency: "USD", maximumFractionDigits: 0 } }}
/>
```

---

## Accessible name

Each chart gets a name from its marks and config labels, such as "Bar chart of Desktop and Mobile".
Set `aria-label` on `ChartContainer` to say what the chart shows.

**Incorrect:**

```astro
<ChartContainer config={revenueConfig} data={revenueData}>
```

**Correct:**

```astro
<ChartContainer
  config={revenueConfig}
  data={revenueData}
  aria-label="Monthly revenue from January to June"
>
```

---

## Tooltip and legend

`ChartContainer` shows a tooltip by default. Add `ChartTooltip` only to change the content. Set
`tooltip={false}` on `ChartContainer` to remove it.

Custom tooltip content goes in the `content` prop in React, a `slot="content"` in Astro and Vue, and
a `content` snippet in Svelte.

```astro
<ChartTooltip>
  <ChartTooltipContent slot="content" indicator="line" />
</ChartTooltip>
```

`ChartLegend` items are buttons that hide or show a series. Control the visible series with
`visible`, `defaultVisible`, and `onVisibleChange` in React, `v-model:visible` in Vue,
`bind:visible` in Svelte, and `visible` in Astro.

---

## Next.js

A chart is a Client Component in Next.js.

**Incorrect:** a chart file with no directive.

```tsx
import { ChartBar, ChartContainer } from "@/components/starwind/chart";
```

**Correct:**

```tsx
"use client";

import { ChartBar, ChartContainer } from "@/components/starwind/chart";
```

---

## Other chart shapes

The parts cover bar, line, area, pie, radar, and radial charts. For another shape, such as
horizontal bars or a scatter chart, write a chart module with `defineChartModule`. Pass it to the
`chart` prop of `ChartContainer` with no parts inside. In Astro, also import the module in a client
`<script>`.

```astro
---
import { ChartContainer } from "@/components/starwind/chart";
import { horizontalBarChart } from "@/charts/horizontal-bar-chart";
import { visitorConfig, visitorData } from "@/charts/visitor-charts";
---

<ChartContainer chart={horizontalBarChart} config={visitorConfig} data={visitorData} />

<script>
  import "@/charts/horizontal-bar-chart";
</script>
```

---

## RTL, Primitive, and Runtime

- In RTL, the tooltip and legend follow the direction. The plot is not mirrored.
- The unstyled Primitive is `@starwind-ui/<framework>/chart` with `Chart.Root`.
- The Runtime entry is `@starwind-ui/runtime/chart` with `createChart`. `initStarwind` does not
  start charts.
