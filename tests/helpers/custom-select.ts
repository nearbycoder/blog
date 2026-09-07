import { expect, type Page } from "@playwright/test";

export async function chooseOption(page: Page, label: string, option: string) {
  const trigger = page.getByRole("combobox", { name: label, exact: true });
  await trigger.click();
  await page
    .getByRole("listbox", { name: label, exact: true })
    .getByRole("option", { name: option, exact: true })
    .click();
  await expect(trigger).toHaveText(option);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
}
