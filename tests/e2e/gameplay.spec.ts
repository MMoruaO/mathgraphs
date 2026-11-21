import { test, expect } from "@playwright/test";

test.describe("MathGraphs Browser Interaction & Gameplay", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date("2026-11-21T12:00:00Z") });
    await page.goto("/");
  });

  test("loads the application with default puzzle", async ({ page }) => {
    await expect(page.locator(".brand-name")).toHaveText("MathGraphs");
    await expect(page.locator(".puzzle-title")).toContainText("Intersección, conjunto y unión");
    await expect(page.locator(".context-math")).toContainText("A");
    await expect(page.locator(".statement-node")).toHaveCount(3);
  });

  test("switches the interface and puzzle content between Spanish and English", async ({ page }) => {
    await page.getByRole("button", { name: "English" }).click();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("MathGraphs — Deductive Mathematical Puzzles");
    await expect(page.locator(".puzzle-title")).toContainText("Intersection, set, and union");
    await expect(page.getByRole("button", { name: "Check" })).toBeVisible();
    await expect(page.locator(".feedback-banner")).toContainText("Select one slot");
    await page.getByRole("button", { name: "Daily challenge" }).click();
    await expect(page.getByRole("heading", { name: "Challenge calendar" })).toBeVisible();
    await expect(page.locator(".daily-date-upcoming").first()).toContainText("Locked until its date");
    await page.getByRole("button", { name: "Close" }).click();

    await page.reload();
    await expect(page.locator(".puzzle-title")).toContainText("Intersection, set, and union");

    await page.getByRole("button", { name: "Puzzles" }).click();
    await expect(page.getByRole("heading", { name: "Mathematical puzzle library" })).toBeVisible();
    const analysisCard = page.locator(".puzzle-card").filter({ hasText: "Regularity and Continuity Hierarchy" });
    await analysisCard.click();
    await expect(page.locator(".puzzle-title")).toContainText("Regularity and Continuity Hierarchy");
    const differentiableSlot = page.locator(".statement-node").filter({ hasText: "s4" });
    await expect(differentiableSlot).toContainText("differentiable");

    await page.getByRole("button", { name: "Español" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(differentiableSlot).toContainText("diferenciable");
    await expect(page.locator(".puzzle-title")).toContainText("Jerarquía de Regularidad y Continuidad");
    await expect(page).toHaveTitle("MathGraphs — Rompecabezas matemáticos");
    await page.reload();
    await expect(page.locator(".puzzle-title")).toContainText("Intersección, conjunto y unión");
  });

  test("click-to-swap mechanic exchanges two tiles and increments moves", async ({ page }) => {
    const statValue = page.locator(".stat-value").first();
    await expect(statValue).toHaveText("0");

    // Click slot s1
    const slot1 = page.locator(".statement-node").filter({ hasText: "s1" });
    const slot2 = page.locator(".statement-node").filter({ hasText: "s2" });

    await slot1.click();
    await expect(slot1).toHaveClass(/statement-node-selected/);
    await expect(page.locator(".selection-indicator")).toContainText("s1");

    // Click slot s2 to swap
    await slot2.click();

    // Verify move count increased to 1
    await expect(statValue).toHaveText("1");
    // Selection should be cleared
    await expect(slot1).not.toHaveClass(/statement-node-selected/);
    await expect(slot2).not.toHaveClass(/statement-node-selected/);
  });

  test("undo reverts the swap and move counter", async ({ page }) => {
    const slot1 = page.locator(".statement-node").filter({ hasText: "s1" });
    const slot2 = page.locator(".statement-node").filter({ hasText: "s2" });
    const statValue = page.locator(".stat-value").first();

    await slot1.click();
    await slot2.click();
    await expect(statValue).toHaveText("1");

    // Click Undo button
    const undoBtn = page.getByRole("button", { name: /Deshacer/i });
    await undoBtn.click();

    await expect(statValue).toHaveText("0");
    await expect(undoBtn).toBeDisabled();
  });

  test("manual check validates constraints and reveals status chips", async ({ page }) => {
    const checkBtn = page.getByRole("button", { name: /Verificar/i });
    await checkBtn.click();

    // In initial scrambled state, status chips should show non-solved feedback
    await expect(page.locator(".status-chips")).toBeVisible();
    await expect(page.locator(".stat-value").nth(1)).toHaveText("1"); // check count
  });

  test("keyboard activation selects and swaps mathematical tiles", async ({ page }) => {
    const slot1 = page.locator(".statement-node").filter({ hasText: "s1" });
    const slot2 = page.locator(".statement-node").filter({ hasText: "s2" });

    await slot1.focus();
    await slot1.press("Enter");
    await expect(slot1).toHaveClass(/statement-node-selected/);

    await slot2.focus();
    await slot2.press("Enter");
    await expect(page.locator(".stat-value").first()).toHaveText("1");
    await expect(slot1).not.toHaveClass(/statement-node-selected/);
  });

  test("solving a puzzle shows the explanation and advances to the next puzzle", async ({ page }) => {
    const swap = async (a: string, b: string) => {
      await page.locator(".statement-node").filter({ hasText: a }).click();
      await page.locator(".statement-node").filter({ hasText: b }).click();
    };

    await swap("s1", "s2");
    await swap("s2", "s3");
    await page.getByRole("button", { name: /Verificar/i }).click();

    await expect(page.getByRole("heading", { name: /Configuración Matemática Válida/i })).toBeVisible();
    await expect(page.locator(".modal-explanation")).toBeVisible();
    await expect(page.locator(".puzzle-sources a")).toHaveAttribute("href", "https://hefferon.net/proofs/");
    await page.getByRole("button", { name: /Siguiente Puzzle/i }).click();
    await expect(page.locator(".puzzle-title")).toContainText("Matrices Idempotentes y Proyecciones");
  });

  test("level selector opens, switches puzzle, and resets state", async ({ page }) => {
    const puzzlesBtn = page.getByRole("button", { name: /Puzzles/i });
    await puzzlesBtn.click();

    await expect(page.locator(".modal-card-wide")).toBeVisible();
    await expect(page.locator(".puzzle-card")).toHaveCount(10);

    // Select the second puzzle: "Jerarquía de Regularidad y Continuidad"
    const analysisCard = page.locator(".puzzle-card").filter({ hasText: "Jerarquía de Regularidad" });
    await analysisCard.click();

    // Modal closes and new puzzle loads
    await expect(page.locator(".modal-card-wide")).not.toBeVisible();
    await expect(page.locator(".puzzle-title")).toContainText("Jerarquía de Regularidad y Continuidad");
    // This puzzle has 4 slots
    await expect(page.locator(".statement-node")).toHaveCount(4);
    // Move count reset to 0
    await expect(page.locator(".stat-value").first()).toHaveText("0");
  });

  test("daily calendar opens archived challenges and keeps future dates locked", async ({ page }) => {
    await page.getByRole("button", { name: "Reto diario" }).click();
    await expect(page.getByRole("heading", { name: "Calendario de retos" })).toBeVisible();
    await expect(page.locator(".daily-date-archived")).toHaveCount(6);
    await expect(page.locator(".daily-date-today")).toHaveCount(1);
    await expect(page.locator(".daily-date-upcoming")).toHaveCount(5);
    await expect(page.locator(".daily-date-upcoming").first()).toBeDisabled();
    await expect(page.locator(".daily-date-upcoming .daily-date-title")).toHaveText(
      Array(5).fill("Bloqueado hasta su fecha")
    );

    await page.locator('.daily-date-card:has(time[datetime="2026-11-16"])').click();
    await expect(page.locator(".puzzle-title")).toContainText("Diferencia, conjunto y unión");
    await expect(page.getByRole("heading", { name: "Calendario de retos" })).not.toBeVisible();
  });
});
