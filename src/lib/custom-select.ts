/** Select-only combobox: explore with arrows/typeahead, commit with Enter/Tab,
 * cancel with Escape. The popover is custom HTML, never an OS select picker.
 * Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
 */
export class CustomSelectElement extends HTMLElement {
  private trigger!: HTMLButtonElement;
  private menu!: HTMLElement;
  private items: HTMLElement[] = [];
  private selected = 0;
  private active = 0;
  private opened = false;
  private buffer = "";
  private typedAt = 0;
  private events?: AbortController;

  get options() {
    return this.items.map((item) => ({
      value: item.dataset.value!,
      label: item.textContent!.trim(),
    }));
  }
  get value() {
    return this.options[this.selected]?.value ?? "";
  }
  set value(value: string) {
    const index = this.options.findIndex((option) => option.value === value);
    if (index >= 0) this.selectedIndex = index;
  }
  get selectedIndex() {
    return this.selected;
  }
  set selectedIndex(index: number) {
    if (!this.items[index]) return;
    this.selected = index;
    this.active = index;
    this.render();
  }

  connectedCallback() {
    this.events?.abort();
    this.events = new AbortController();
    const { signal } = this.events;
    this.trigger = this.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    this.menu = this.querySelector<HTMLElement>('[role="listbox"]')!;
    this.items = [...this.querySelectorAll<HTMLElement>('[role="option"]')];
    this.trigger.disabled = !this.items.length;
    this.render();
    this.trigger.addEventListener(
      "click",
      () => (this.opened ? this.close() : this.open()),
      { signal },
    );
    this.trigger.addEventListener("keydown", (event) => this.onKey(event), {
      signal,
    });
    this.menu.addEventListener(
      "mousedown",
      (event) => {
        // Cancel mouse focus transfer, including the compatibility mouse event
        // after a touch tap. Touch/pointer events remain free to scroll the list.
        event.preventDefault();
      },
      { signal },
    );
    this.items.forEach((item, index) => {
      item.addEventListener(
        "pointermove",
        (event) => {
          if (event.pointerType === "mouse" && this.active !== index)
            this.highlight(index, false);
        },
        { signal },
      );
      item.addEventListener(
        "click",
        () => {
          this.active = index;
          this.commit();
          this.trigger.focus({ preventScroll: true });
        },
        { signal },
      );
    });
    document.addEventListener(
      "pointerdown",
      (event) => {
        if (this.opened && !this.contains(event.target as Node)) this.close();
      },
      { signal },
    );
    this.addEventListener(
      "focusout",
      (event) => {
        if (
          this.opened &&
          event.relatedTarget &&
          !this.contains(event.relatedTarget as Node)
        )
          this.commit();
      },
      { signal },
    );
    window.addEventListener("resize", () => this.position(), { signal });
    // Keep the menu anchored through browser scrolling (including scroll-to-focus).
    document.addEventListener(
      "scroll",
      (event) => {
        if (this.opened && event.target !== this.menu) this.position();
      },
      { capture: true, signal },
    );
    window.visualViewport?.addEventListener("resize", () => this.position(), {
      signal,
    });
    document.addEventListener(
      "toggle",
      (event) => {
        if (
          event.target instanceof HTMLDetailsElement &&
          !event.target.open &&
          event.target.contains(this)
        )
          this.close();
      },
      { capture: true, signal },
    );
  }

  disconnectedCallback() {
    this.close();
    this.events?.abort();
  }

  private render() {
    this.querySelector("[data-select-value]")!.textContent =
      this.options[this.selected]?.label ?? "";
    this.items.forEach((item, index) => {
      item.setAttribute("aria-selected", String(index === this.selected));
      item.dataset.active = String(this.opened && index === this.active);
    });
    this.trigger.setAttribute("aria-expanded", String(this.opened));
    if (this.opened)
      this.trigger.setAttribute(
        "aria-activedescendant",
        this.items[this.active].id,
      );
    else this.trigger.removeAttribute("aria-activedescendant");
  }

  private open() {
    if (this.opened || !this.items.length) return;
    document
      .querySelectorAll<CustomSelectElement>("custom-select")
      .forEach((control) => control.close());
    this.active = this.selected;
    this.buffer = "";
    this.opened = true;
    this.menu.hidden = false;
    this.menu.showPopover?.();
    this.position();
    this.highlight(this.active);
  }

  private close() {
    if (!this.opened) return;
    this.opened = false;
    this.menu.hidePopover?.();
    this.menu.hidden = true;
    this.buffer = "";
    this.render();
  }

  private commit() {
    const changed = this.selected !== this.active;
    this.selected = this.active;
    this.close();
    if (changed) {
      this.dispatchEvent(new Event("input", { bubbles: true }));
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  private position() {
    if (!this.opened) return;
    const rect = this.trigger.getBoundingClientRect();
    if (
      !rect.width ||
      !rect.height ||
      rect.bottom < 0 ||
      rect.top > innerHeight
    ) {
      this.close();
      return;
    }
    const viewport = window.visualViewport;
    const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
    const topEdge = (viewport?.offsetTop ?? 0) + 8;
    const rightEdge = leftEdge + (viewport?.width ?? innerWidth) - 16;
    const bottomEdge = topEdge + (viewport?.height ?? innerHeight) - 16;
    const width = Math.min(Math.max(rect.width, 220), rightEdge - leftEdge);
    const below = bottomEdge - rect.bottom - 6;
    const above = rect.top - topEdge - 6;
    const up = below < Math.min(this.menu.scrollHeight, 240) && above > below;
    this.menu.style.width = `${width}px`;
    this.menu.style.maxHeight = `${Math.max(44, Math.min(320, up ? above : below))}px`;
    this.menu.style.left = `${Math.max(leftEdge, Math.min(rect.left, rightEdge - width))}px`;
    const height = this.menu.getBoundingClientRect().height;
    this.menu.style.top = `${up ? rect.top - height - 6 : rect.bottom + 6}px`;
  }

  private highlight(index: number, scroll = true) {
    this.active = Math.max(0, Math.min(this.items.length - 1, index));
    this.render();
    if (scroll) {
      const item = this.items[this.active];
      // Rectangles work for both top-layer popovers and the fixed fallback.
      const itemRect = item.getBoundingClientRect(),
        menuRect = this.menu.getBoundingClientRect();
      if (itemRect.top < menuRect.top + 5)
        this.menu.scrollTop -= menuRect.top + 5 - itemRect.top;
      else if (itemRect.bottom > menuRect.bottom - 5)
        this.menu.scrollTop += itemRect.bottom - menuRect.bottom + 5;
    }
  }

  private onKey(event: KeyboardEvent) {
    if (
      event.ctrlKey ||
      event.metaKey ||
      (event.altKey && !["ArrowDown", "ArrowUp"].includes(event.key))
    )
      return;
    const key = event.key;
    if (key === "Escape" && this.opened) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    if (key === "Tab") {
      if (this.opened) this.commit();
      return;
    }
    if (event.altKey && key === "ArrowUp") {
      if (this.opened) {
        event.preventDefault();
        this.commit();
      }
      return;
    }
    if (
      [
        "Enter",
        " ",
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
        "PageDown",
        "PageUp",
      ].includes(key)
    ) {
      event.preventDefault();
      event.stopPropagation();
      const wasOpen = this.opened;
      this.open();
      if (key === "Enter" || key === " ") {
        if (wasOpen) this.commit();
      } else if (key === "Home") this.highlight(0);
      else if (key === "End") this.highlight(this.items.length - 1);
      else if (wasOpen && !event.altKey)
        this.highlight(
          this.active +
            ({ ArrowDown: 1, ArrowUp: -1, PageDown: 10, PageUp: -10 }[key] ??
              0),
        );
      return;
    }
    if (key.length === 1 && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      this.open();
      const now = Date.now();
      this.buffer =
        now - this.typedAt > 700
          ? key.toLowerCase()
          : this.buffer + key.toLowerCase();
      this.typedAt = now;
      const repeated = [...this.buffer].every(
        (char) => char === this.buffer[0],
      );
      const query = repeated ? this.buffer[0] : this.buffer;
      const start = repeated ? this.active + 1 : this.active;
      for (let step = 0; step < this.items.length; step++) {
        const index = (start + step) % this.items.length;
        if (this.options[index].label.toLowerCase().startsWith(query)) {
          this.highlight(index);
          break;
        }
      }
    }
  }
}

if (!customElements.get("custom-select"))
  customElements.define("custom-select", CustomSelectElement);
