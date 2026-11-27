# Forms And Inputs

Starwind v3 controls participate in native forms through the Runtime. Preserve names, values,
disabled state, validity, labels, descriptions, errors, submit behavior, and reset behavior.

## Contents

- choosing native markup, Form, Field, and FieldSet
- labels and native submission
- initial versus controlled state
- Input Group anatomy and alignment
- validation and reset checks

## Choose Structure

- Use `form` and `field` when their documented management, grouping, validation, or
  error-summary behavior fits the task. `FieldSet` and `FieldLegend` are parts of `field`. There is
  no styled `fieldset` component to install.
- Use semantic HTML plus `label` and Starwind controls for simple forms.
- Use `checkbox-group` for related checkboxes and `radio-group` for one-of-many choices.
- Use Select for a fixed choice list, standalone Combobox for searchable choice, and Native Select
  for browser-native behavior.

Do not copy shadcn React form helpers into Starwind. Read current framework-specific docs and local
exports before assuming a Field/Form prop.

## Field And Form

Use the V3 Field anatomy when Runtime-managed validation and messages are useful:

```astro
---
import { Form, FormErrorSummary } from "@/components/starwind/form";
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/starwind/field";
---

<Form>
  <FormErrorSummary />
  <FieldGroup>
    <Field name="email">
      <FieldLabel>Email</FieldLabel>
      <FieldControl type="email" autocomplete="email" required />
      <FieldDescription>Use your work email.</FieldDescription>
      <FieldError match="valueMissing">Enter an email address.</FieldError>
      <FieldError match="typeMismatch">Enter a valid email address.</FieldError>
    </Field>
  </FieldGroup>
</Form>
```

`FieldLabel`, `FieldDescription`, and `FieldError` are connected through the Field contract. Keep
`name` on Field and native constraints on `FieldControl`.

React, Vue, and Svelte use the same part anatomy through their local exports. Use the attribute
names and state syntax of the file's framework. See [frameworks.md](./frameworks.md).

### Group related controls with FieldSet

**Incorrect:** a styled `div` with a heading, or a `fieldset` component that does not exist.

```astro
---
import { Fieldset } from "@/components/starwind/fieldset";
---

<div class="flex flex-col gap-2">
  <h3>Notifications</h3>
  <Switch name="email" label="Email" />
</div>
```

**Correct:** `FieldSet` and `FieldLegend` from `field`.

```astro
---
import { FieldGroup, FieldLegend, FieldSet } from "@/components/starwind/field";
import { Switch } from "@/components/starwind/switch";
---

<FieldSet>
  <FieldLegend>Notifications</FieldLegend>
  <FieldGroup>
    <Switch name="email" label="Email" />
    <Switch name="sms" label="SMS" />
  </FieldGroup>
</FieldSet>
```

## Labels And Native Semantics

For a simple labeled control, preserve normal HTML association.

Astro:

```astro
<Label for="email">Email</Label>
<Input id="email" name="email" type="email" autocomplete="email" required />
```

React:

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" name="email" type="email" autoComplete="email" required />
```

Vue and Svelte use `for` and `autocomplete`, as in Astro.

Match the label target to the control ID. Keep `name` on every value that should appear in
`FormData`. Put required, read-only, disabled, and validity state on the actual control/root
documented to own it.

## Initial And Controlled State

Astro markup is static after render; Runtime owns later interaction.

- Use `defaultChecked` for initial Checkbox, Switch, and checked menu-item state.
- Use `defaultValue` on the Select or Combobox root for initial custom-choice state.
- For Astro Native Select, use native `selected` option semantics.
- Use documented command events or Runtime instances for later programmatic Astro changes.

React uses documented controlled props and callbacks. Vue uses `v-model:checked` on Switch and
Checkbox and `v-model` on the Select root. Svelte uses `bind:`, for example `bind:value`. Do
not infer a controlled API from an Astro prop or treat an Astro `checked`/`value` prop as reactive.
Check the component docs or the installed package docs for the exact model name.

## Input Group

Use Input Group for prefix/suffix text, icons, buttons, or textarea addons:

```astro
<InputGroup>
  <InputGroupAddon align="inline-start">
    <InputGroupText>https://</InputGroupText>
  </InputGroupAddon>
  <InputGroupInput id="site" name="site" aria-label="Website" placeholder="example.com" />
  <InputGroupAddon align="inline-end">
    <InputGroupButton type="button" size="sm">Check</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

**Incorrect:** a raw `Input` inside the group.

```astro
<InputGroup>
  <InputGroupAddon align="inline-start"><InputGroupText>https://</InputGroupText></InputGroupAddon>
  <Input id="site" name="site" aria-label="Website" />
</InputGroup>
```

**Correct:**

```astro
<InputGroup>
  <InputGroupAddon align="inline-start"><InputGroupText>https://</InputGroupText></InputGroupAddon>
  <InputGroupInput id="site" name="site" aria-label="Website" />
</InputGroup>
```

- Use `InputGroupInput` or `InputGroupTextarea` inside the group.
- Supported addon alignments are `inline-start`, `inline-end`, `block-start`, and `block-end`.
- Use `InputGroupAddon` for presentational icons/text and `InputGroupButton` for actions.
- Keep children in a logical reading order; the alignment variant controls visual placement.
- Give the actual input an accessible name. Clicking an addon is not the naming mechanism.

Block alignment can label or describe an input/textarea vertically:

```astro
<InputGroup>
  <InputGroupAddon align="block-start"><InputGroupText>Message</InputGroupText></InputGroupAddon>
  <InputGroupTextarea id="message" name="message" />
  <InputGroupAddon align="block-end"><InputGroupText>120 characters left</InputGroupText></InputGroupAddon>
</InputGroup>
```

## Validation

For native/simple forms, associate the error explicitly:

```astro
<Label for="username">Username</Label>
<Input id="username" name="username" aria-invalid="true" aria-describedby="username-error" />
<p id="username-error" class="text-error text-sm">Choose a username.</p>
```

- Pair invalid state with nearby error text; do not rely on color alone.
- Keep descriptions and errors associated with the actual focusable control.
- Preserve native `required`, `disabled`, and `readOnly` behavior.
- Give each focusable Radio item and the Input OTP root an explicit accessible name.
- Test both submit and reset; Runtime controls must produce the expected `FormData` and restore
  initial state.

A form change is complete when keyboard and screen-reader names are coherent, submitted values and
reset state are correct, and the framework's current controlled/uncontrolled contract is respected.
