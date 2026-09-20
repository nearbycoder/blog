import css from "../styles/desktop-worldclock.css?inline";
import { installAppStyle } from "./desktop-app-style";
installAppStyle("worldclock", css);

type City = { id: string; name: string; zone: string; region: string };
type ClockStore = { version: 1; cities: string[]; format: "12" | "24" };
const STORAGE_KEY = "nearby-desktop-worldclock-v1";
const MAX_CLOCKS = 6;
const CITY_LIST: City[] = [
  {
    id: "honolulu",
    name: "Honolulu",
    zone: "Pacific/Honolulu",
    region: "United States",
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    zone: "America/Los_Angeles",
    region: "United States",
  },
  {
    id: "vancouver",
    name: "Vancouver",
    zone: "America/Vancouver",
    region: "Canada",
  },
  {
    id: "mexico-city",
    name: "Mexico City",
    zone: "America/Mexico_City",
    region: "Mexico",
  },
  {
    id: "chicago",
    name: "Chicago",
    zone: "America/Chicago",
    region: "United States",
  },
  {
    id: "new-york",
    name: "New York",
    zone: "America/New_York",
    region: "United States",
  },
  { id: "toronto", name: "Toronto", zone: "America/Toronto", region: "Canada" },
  {
    id: "sao-paulo",
    name: "São Paulo",
    zone: "America/Sao_Paulo",
    region: "Brazil",
  },
  {
    id: "utc",
    name: "UTC",
    zone: "Etc/UTC",
    region: "Coordinated Universal Time",
  },
  {
    id: "london",
    name: "London",
    zone: "Europe/London",
    region: "United Kingdom",
  },
  { id: "paris", name: "Paris", zone: "Europe/Paris", region: "France" },
  { id: "berlin", name: "Berlin", zone: "Europe/Berlin", region: "Germany" },
  { id: "cairo", name: "Cairo", zone: "Africa/Cairo", region: "Egypt" },
  {
    id: "johannesburg",
    name: "Johannesburg",
    zone: "Africa/Johannesburg",
    region: "South Africa",
  },
  { id: "nairobi", name: "Nairobi", zone: "Africa/Nairobi", region: "Kenya" },
  {
    id: "dubai",
    name: "Dubai",
    zone: "Asia/Dubai",
    region: "United Arab Emirates",
  },
  { id: "mumbai", name: "Mumbai", zone: "Asia/Kolkata", region: "India" },
  {
    id: "kathmandu",
    name: "Kathmandu",
    zone: "Asia/Kathmandu",
    region: "Nepal",
  },
  { id: "bangkok", name: "Bangkok", zone: "Asia/Bangkok", region: "Thailand" },
  {
    id: "singapore",
    name: "Singapore",
    zone: "Asia/Singapore",
    region: "Singapore",
  },
  {
    id: "hong-kong",
    name: "Hong Kong",
    zone: "Asia/Hong_Kong",
    region: "China",
  },
  { id: "tokyo", name: "Tokyo", zone: "Asia/Tokyo", region: "Japan" },
  { id: "seoul", name: "Seoul", zone: "Asia/Seoul", region: "South Korea" },
  {
    id: "sydney",
    name: "Sydney",
    zone: "Australia/Sydney",
    region: "Australia",
  },
  {
    id: "auckland",
    name: "Auckland",
    zone: "Pacific/Auckland",
    region: "New Zealand",
  },
];

export function mountApp(root: HTMLElement): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const windowElement = root.closest<HTMLElement>(".utility-window");
  const localZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Etc/UTC";
  const cities: City[] = [
    {
      id: "local",
      name: "Local time",
      zone: localZone,
      region: "Your device timezone",
    },
    ...CITY_LIST,
  ];
  let store: ClockStore = {
    version: 1,
    cities: ["local", "london", "tokyo"],
    format: "24",
  };
  let blockedStorage = false;
  let storageMessage = "Clock choices are saved on this device.";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      if (raw.length > 2000) throw new Error("Saved clocks are too large");
      const value = JSON.parse(raw) as Partial<ClockStore> | null;
      if (
        !value ||
        value.version !== 1 ||
        !Array.isArray(value.cities) ||
        value.cities.length > MAX_CLOCKS ||
        !value.cities.every(
          (id) =>
            typeof id === "string" && cities.some((city) => city.id === id),
        ) ||
        new Set(value.cities).size !== value.cities.length ||
        (value.format !== "12" && value.format !== "24")
      )
        throw new Error("Invalid saved clocks");
      store = { version: 1, cities: value.cities, format: value.format };
    }
  } catch {
    blockedStorage = true;
    storageMessage =
      "Saved clocks could not be read. Changes stay in this session; original data is unchanged.";
  }
  let preview: Date | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let disposed = false;
  let removed: { id: string; index: number } | null = null;

  root.classList.add("worldclock-app");
  root.innerHTML = `
    <div class="desk-app-toolbar worldclock-toolbar">
      <span class="worldclock-mode" data-worldclock-mode>Live clocks</span>
      <span class="worldclock-count" data-worldclock-count></span>
      <button type="button" data-worldclock-picker-toggle aria-expanded="false" aria-controls="worldclock-picker">Add city</button>
      <label class="worldclock-format">Time format <select data-worldclock-format aria-label="Time format"><option value="24">24-hour</option><option value="12">12-hour</option></select></label>
    </div>
    <div class="worldclock-body">
      <section class="worldclock-picker" id="worldclock-picker" aria-label="Add a city clock" hidden>
        <label for="worldclock-search">Find a city or timezone</label>
        <input type="search" id="worldclock-search" data-worldclock-search autocomplete="off" maxlength="80" placeholder="City, country or IANA timezone" />
        <div class="worldclock-results" data-worldclock-results></div>
        <p class="worldclock-search-message" data-worldclock-search-message role="status"></p>
      </section>
      <section class="worldclock-planner" aria-labelledby="worldclock-planner-title">
        <div class="worldclock-planner-heading"><h2 id="worldclock-planner-title">Meeting preview</h2><span data-worldclock-local-zone></span></div>
        <form data-worldclock-preview-form novalidate>
          <label>Date <input type="date" aria-label="Meeting date" data-worldclock-date min="2000-01-01" max="2100-12-31" required /></label>
          <label>Local time <input type="time" aria-label="Meeting time" data-worldclock-time required /></label>
          <button type="submit">Preview time</button>
          <button type="button" data-worldclock-live disabled>Reset to live</button>
        </form>
        <p class="worldclock-hint">Use your device’s local time. Repeated daylight saving hours use their first occurrence.</p>
        <p class="worldclock-error" data-worldclock-error role="alert" hidden></p>
      </section>
      <div class="worldclock-grid" data-worldclock-grid aria-label="City clocks"></div>
      <p class="worldclock-empty" data-worldclock-empty hidden>No clocks yet. Add a city to see its local time.</p>
      <div class="worldclock-undo" data-worldclock-undo-row hidden><span data-worldclock-removed></span><button type="button" data-worldclock-undo>Undo remove</button></div>
    </div>
    <p class="desk-app-status worldclock-status" data-worldclock-status role="status"></p>`;

  const find = <T extends HTMLElement>(selector: string) =>
    root.querySelector<T>(selector)!;
  const grid = find<HTMLElement>("[data-worldclock-grid]");
  const dateInput = find<HTMLInputElement>("[data-worldclock-date]");
  const timeInput = find<HTMLInputElement>("[data-worldclock-time]");
  const search = find<HTMLInputElement>("[data-worldclock-search]");
  const picker = find<HTMLElement>("[data-worldclock-picker-toggle]");
  const pickerPanel = find<HTMLElement>("#worldclock-picker");
  const format = find<HTMLSelectElement>("[data-worldclock-format]");
  const error = find<HTMLElement>("[data-worldclock-error]");
  const status = find<HTMLElement>("[data-worldclock-status]");
  const cards = new Map<
    string,
    {
      card: HTMLElement;
      time: HTMLTimeElement;
      date: HTMLElement;
      zone: HTMLElement;
      period: HTMLElement;
    }
  >();
  const formatters = new Map<string, Intl.DateTimeFormat>();
  find<HTMLElement>("[data-worldclock-local-zone]").textContent =
    `Local: ${localZone}`;
  format.value = store.format;

  function formatter(
    zone: string,
    purpose: "time" | "date" | "parts" | "offset",
  ) {
    const key = `${zone}:${purpose}:${store.format}`;
    let value = formatters.get(key);
    if (!value) {
      const options: Intl.DateTimeFormatOptions = { timeZone: zone };
      if (purpose === "time")
        Object.assign(options, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: store.format === "24" ? "h23" : "h12",
        });
      if (purpose === "date")
        Object.assign(options, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      if (purpose === "parts")
        Object.assign(options, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          hourCycle: "h23",
        });
      if (purpose === "offset")
        Object.assign(options, { timeZoneName: "shortOffset" });
      value = new Intl.DateTimeFormat("en-US", options);
      formatters.set(key, value);
    }
    return value;
  }

  function announce(message = "") {
    status.textContent = `${message ? `${message} ` : ""}${storageMessage}`;
  }
  function save(message: string) {
    if (!blockedStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        storageMessage = "Clock choices are saved on this device.";
      } catch {
        storageMessage =
          "Not saved: browser storage is unavailable. Changes stay in this session.";
      }
    }
    announce(message);
  }
  function fillDateInputs() {
    const now = new Date();
    const pad = (number: number) => String(number).padStart(2, "0");
    dateInput.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    timeInput.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
  function updateTimes() {
    const instant = preview ?? new Date();
    const localDay = Date.UTC(
      instant.getFullYear(),
      instant.getMonth(),
      instant.getDate(),
    );
    for (const id of store.cities) {
      const city = cities.find((item) => item.id === id)!;
      const nodes = cards.get(id)!;
      const parts = Object.fromEntries(
        formatter(city.zone, "parts")
          .formatToParts(instant)
          .map((part) => [part.type, part.value]),
      );
      const hour = Number(parts.hour);
      const period =
        hour >= 6 && hour < 12
          ? "Morning"
          : hour >= 12 && hour < 18
            ? "Afternoon"
            : hour >= 18 && hour < 22
              ? "Evening"
              : "Night";
      const dayOffset = Math.round(
        (Date.UTC(
          Number(parts.year),
          Number(parts.month) - 1,
          Number(parts.day),
        ) -
          localDay) /
          86_400_000,
      );
      const relativeDay =
        dayOffset === 0
          ? "Same day"
          : dayOffset === 1
            ? "Next day"
            : dayOffset === -1
              ? "Previous day"
              : `${dayOffset > 0 ? "+" : ""}${dayOffset} days`;
      const offset =
        formatter(city.zone, "offset")
          .formatToParts(instant)
          .find((part) => part.type === "timeZoneName")?.value ?? "";
      nodes.card.dataset.period = period.toLowerCase();
      nodes.time.textContent = formatter(city.zone, "time").format(instant);
      nodes.time.dateTime = instant.toISOString();
      nodes.date.textContent = formatter(city.zone, "date").format(instant);
      nodes.zone.textContent = `${city.zone} · ${offset}`;
      nodes.period.textContent = `${period} · ${relativeDay}`;
    }
  }
  function renderClocks() {
    grid.replaceChildren();
    cards.clear();
    for (const id of store.cities) {
      const city = cities.find((item) => item.id === id)!;
      const card = document.createElement("article");
      card.className = "worldclock-card";
      card.dataset.city = id;
      card.setAttribute("aria-label", `${city.name} clock`);
      card.innerHTML = `<div class="worldclock-card-heading"><h3></h3><button type="button" class="worldclock-remove">×</button></div><time class="worldclock-time"></time><p class="worldclock-date"></p><p class="worldclock-zone"></p><p class="worldclock-period"></p>`;
      card.querySelector("h3")!.textContent = city.name;
      const remove = card.querySelector<HTMLButtonElement>("button")!;
      remove.dataset.removeCity = id;
      remove.setAttribute("aria-label", `Remove ${city.name}`);
      remove.title = `Remove ${city.name}`;
      cards.set(id, {
        card,
        time: card.querySelector("time")!,
        date: card.querySelector(".worldclock-date")!,
        zone: card.querySelector(".worldclock-zone")!,
        period: card.querySelector(".worldclock-period")!,
      });
      grid.append(card);
    }
    find<HTMLElement>("[data-worldclock-empty]").hidden =
      store.cities.length > 0;
    find<HTMLElement>("[data-worldclock-count]").textContent =
      `${store.cities.length} / ${MAX_CLOCKS}`;
    find<HTMLElement>("[data-worldclock-undo-row]").hidden = removed === null;
    find<HTMLButtonElement>("[data-worldclock-undo]").disabled =
      store.cities.length >= MAX_CLOCKS;
    updateTimes();
    renderResults();
    syncTimer();
  }
  function renderResults() {
    const results = find<HTMLElement>("[data-worldclock-results]");
    results.replaceChildren();
    const term = search.value
      .trim()
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const matches = cities.filter(
      (city) =>
        !store.cities.includes(city.id) &&
        `${city.name} ${city.region} ${city.zone}`
          .toLocaleLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(term),
    );
    for (const city of matches) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.addCity = city.id;
      button.disabled = store.cities.length >= MAX_CLOCKS;
      button.setAttribute("aria-label", `Add ${city.name}`);
      const name = document.createElement("strong");
      name.textContent = `+ ${city.name}`;
      const zone = document.createElement("span");
      zone.textContent = city.zone;
      button.append(name, zone);
      results.append(button);
    }
    find<HTMLElement>("[data-worldclock-search-message]").textContent =
      store.cities.length >= MAX_CLOCKS
        ? "Six clocks is the limit. Remove a city to add another."
        : matches.length
          ? `${matches.length} available ${matches.length === 1 ? "city" : "cities"}.`
          : "No available cities match. Try a city, country or timezone.";
  }
  function syncTimer() {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
    if (
      disposed ||
      preview ||
      store.cities.length === 0 ||
      document.hidden ||
      root.hidden ||
      windowElement?.hidden
    )
      return;
    updateTimes();
    timer = setInterval(updateTimes, 1000);
  }
  function setError(message: string) {
    error.textContent = message;
    error.hidden = !message;
    dateInput.setAttribute("aria-invalid", String(Boolean(message)));
    timeInput.setAttribute("aria-invalid", String(Boolean(message)));
  }
  picker.addEventListener(
    "click",
    () => {
      pickerPanel.hidden = !pickerPanel.hidden;
      picker.setAttribute("aria-expanded", String(!pickerPanel.hidden));
      if (!pickerPanel.hidden) search.focus();
    },
    { signal },
  );
  search.addEventListener("input", renderResults, { signal });
  root.addEventListener(
    "click",
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "button",
      );
      if (!button || !root.contains(button)) return;
      if (button.dataset.addCity) {
        const id = button.dataset.addCity;
        if (
          store.cities.length >= MAX_CLOCKS ||
          store.cities.includes(id) ||
          !cities.some((city) => city.id === id)
        )
          return;
        store.cities.push(id);
        if (removed?.id === id) removed = null;
        save(`${cities.find((city) => city.id === id)!.name} added.`);
        renderClocks();
        search.focus();
      }
      if (button.dataset.removeCity) {
        const id = button.dataset.removeCity;
        const index = store.cities.indexOf(id);
        if (index < 0) return;
        removed = { id, index };
        store.cities.splice(index, 1);
        const name = cities.find((city) => city.id === id)!.name;
        find<HTMLElement>("[data-worldclock-removed]").textContent =
          `${name} removed.`;
        save(`${name} removed.`);
        renderClocks();
        const next =
          grid.querySelectorAll<HTMLButtonElement>("button")[
            Math.min(index, store.cities.length - 1)
          ];
        (next ?? picker).focus();
      }
    },
    { signal },
  );
  find<HTMLElement>("[data-worldclock-undo]").addEventListener(
    "click",
    () => {
      if (!removed || store.cities.length >= MAX_CLOCKS) return;
      store.cities.splice(removed.index, 0, removed.id);
      removed = null;
      save("Clock restored.");
      renderClocks();
      picker.focus();
    },
    { signal },
  );
  format.addEventListener(
    "change",
    () => {
      store.format = format.value === "12" ? "12" : "24";
      formatters.clear();
      updateTimes();
      save(`${store.format}-hour time selected.`);
    },
    { signal },
  );
  find<HTMLFormElement>("[data-worldclock-preview-form]").addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInput.value);
      const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeInput.value);
      if (!dateMatch || !timeMatch) {
        setError("Enter a date and time to preview.");
        return;
      }
      const [, year, month, day] = dateMatch.map(Number);
      const [, hour, minute] = timeMatch.map(Number);
      if (
        year < 2000 ||
        year > 2100 ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hour > 23 ||
        minute > 59
      ) {
        setError(
          "Choose a valid date from 2000 through 2100 and a time from 00:00 to 23:59.",
        );
        return;
      }
      const instant = new Date(year, month - 1, day, hour, minute);
      if (
        instant.getFullYear() !== year ||
        instant.getMonth() !== month - 1 ||
        instant.getDate() !== day ||
        instant.getHours() !== hour ||
        instant.getMinutes() !== minute
      ) {
        setError(
          "That local date or time does not exist. Check the date or choose a time outside the daylight saving jump.",
        );
        return;
      }
      preview = instant;
      setError("");
      find<HTMLElement>("[data-worldclock-mode]").textContent =
        "Preview · paused";
      find<HTMLButtonElement>("[data-worldclock-live]").disabled = false;
      root.dataset.mode = "preview";
      updateTimes();
      syncTimer();
      announce(
        `Previewing ${dateInput.value} at ${timeInput.value} in ${localZone}.`,
      );
    },
    { signal },
  );
  find<HTMLElement>("[data-worldclock-live]").addEventListener(
    "click",
    () => {
      preview = null;
      setError("");
      fillDateInputs();
      find<HTMLElement>("[data-worldclock-mode]").textContent = "Live clocks";
      find<HTMLButtonElement>("[data-worldclock-live]").disabled = true;
      root.dataset.mode = "live";
      syncTimer();
      announce("Showing live time.");
    },
    { signal },
  );
  const observer = new MutationObserver(syncTimer);
  observer.observe(root, { attributes: true, attributeFilter: ["hidden"] });
  if (windowElement)
    observer.observe(windowElement, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  document.addEventListener("visibilitychange", syncTimer, { signal });
  root.dataset.mode = "live";
  fillDateInputs();
  renderClocks();
  announce();
  return () => {
    disposed = true;
    if (timer !== undefined) clearInterval(timer);
    controller.abort();
    observer.disconnect();
    formatters.clear();
  };
}
