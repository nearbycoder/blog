# Custom dropdowns

All ten choice controls use `CustomSelect.astro`: article time and sort, discovery topic and time, reading size/spacing/width, citation format, feed selection, and the agent lab scenario. There are no native select pickers. Both the field and its menu inherit the blog's existing light/dark tokens, typography, and corner radius. This is a targeted editorial refinement: design variance 6, motion intensity 2 (state feedback only), visual density 3.

The select-only combobox follows the [WAI-ARIA interaction pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/). Arrow keys, Home/End, Page Up/Down, and typeahead explore options without changing the current value. Enter, Space, or Tab commits; Escape and outside clicks cancel. Only one dropdown opens at once. Focus stays on the labelled trigger and the active option remains visible in long lists. Menus use custom HTML in a top-layer popover, with fixed positioning as a fallback, and fit or flip within the viewport. Controls are disabled until JavaScript initializes them.

The component's value setter updates the visible text and selected option without dispatching change events. User commits dispatch bubbling input/change events, preserving existing filters, URL history, local preferences, resets, and citation/feed updates. No dependency or external service was added.

Verification covers every dropdown in both themes, open-menu accessibility, keyboard and touch behavior, narrow viewports, persistence, and history navigation. Existing feature tests now interact with visible custom options. The route suite prevents native select controls from returning anywhere in generated pages.
