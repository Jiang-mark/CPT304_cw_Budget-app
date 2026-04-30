import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(".");
const indexHtml = readFileSync(resolve(root, "index.html"), "utf8").replace(
  /<script[\s\S]*?<\/script>/g,
  ""
);
const privacyHtml = readFileSync(resolve(root, "privacy.html"), "utf8").replace(
  /<script[\s\S]*?<\/script>/g,
  ""
);

function modulePath(fileName) {
  return `../${fileName}?cache=${Date.now()}-${Math.random()}`;
}

function mockBrowserApis() {
  HTMLInputElement.prototype.reportValidity = vi.fn(() => true);

  window.matchMedia = vi.fn((query) => ({
    matches: query.includes("max-width") ? false : query.includes("min-width"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    set lineWidth(value) {
      this._lineWidth = value;
    },
    get lineWidth() {
      return this._lineWidth || 0;
    },
    set strokeStyle(value) {
      this._strokeStyle = value;
    },
    get strokeStyle() {
      return this._strokeStyle || "";
    },
  }));

  window.ResizeObserver = class {
    observe = vi.fn();
    disconnect = vi.fn();
  };
}

function renderDocument(html) {
  document.open();
  document.write(html);
  document.close();
}

async function loadBudgetApp() {
  renderDocument(indexHtml);
  localStorage.clear();
  mockBrowserApis();

  await import(modulePath("i18n.js"));
  await import(modulePath("chart.js"));
  await import(modulePath("budget.js"));
}

async function loadPrivacyPage() {
  renderDocument(privacyHtml);
  localStorage.clear();
  mockBrowserApis();

  await import(modulePath("i18n.js"));
}

beforeEach(() => {
  vi.restoreAllMocks();
  renderDocument("<!DOCTYPE html><html><head></head><body></body></html>");
  localStorage.clear();
});

describe("budget entries", () => {
  it("rejects invalid amounts and accepts a two-decimal income", async () => {
    await loadBudgetApp();

    document.querySelector(".second-tab").click();
    document.querySelector("#income-title-input").value = "Salary";

    for (const invalidAmount of ["-1", "0", "10.999", "1e3"]) {
      document.querySelector("#income-amount-input").value = invalidAmount;
      document.querySelector(".add-income").click();
      expect(document.querySelector("#income .list").textContent).not.toContain("Salary");
    }

    document.querySelector("#income-amount-input").value = "123.45";
    document.querySelector(".add-income").click();

    expect(document.querySelector("#income .list").textContent).toContain("Salary : $123.45");
    expect(document.querySelector(".income-total").textContent).toContain("$123.45");
    expect(document.querySelector(".balance .value").textContent).toContain("$123.45");
  });

  it("adds expenses safely as text instead of executable HTML", async () => {
    await loadBudgetApp();

    document.querySelector(".first-tab").click();
    document.querySelector("#expense-title-input").value =
      "<img src=x onerror=\"window.__xssProbe = true\">";
    document.querySelector("#expense-amount-input").value = "12.30";
    document.querySelector(".add-expense").click();

    expect(window.__xssProbe).toBeUndefined();
    expect(document.querySelector("#expense .list img")).toBeNull();
    expect(document.querySelector("#expense .list").textContent).toContain(
      "<img src=x onerror=\"window.__xssProbe = true\"> : $12.30"
    );
    expect(document.querySelector(".outcome-total").textContent).toContain("$12.30");
  });

  it("switches dashboard tabs and supports editing and deleting entries", async () => {
    await loadBudgetApp();

    document.querySelector(".second-tab").click();
    document.querySelector("#income-title-input").value = "Bonus";
    document.querySelector("#income-amount-input").value = "25";
    document.querySelector(".add-income").click();

    expect(document.querySelector(".second-tab").classList.contains("focus")).toBe(true);
    expect(document.querySelector("#income").classList.contains("hide")).toBe(false);

    document.querySelector("#income #edit").click();
    expect(document.querySelector("#income-title-input").value).toBe("Bonus");
    expect(document.querySelector("#income-amount-input").value).toBe("25");
    expect(document.querySelector("#income .list").textContent).not.toContain("Bonus");

    document.querySelector("#income-amount-input").value = "30";
    document.querySelector(".add-income").click();
    document.querySelector(".third-tab").click();

    expect(document.querySelector(".third-tab").classList.contains("focus")).toBe(true);
    expect(document.querySelector("#all .list").textContent).toContain("Bonus : $30.00");

    document.querySelector("#all #delete").click();
    expect(document.querySelector("#all .list").textContent).not.toContain("Bonus");
  });

  it("filters invalid stored entries before rendering", async () => {
    localStorage.setItem(
      "entry_list",
      JSON.stringify([
        { type: "income", title: "Valid", amount: 10 },
        { type: "income", title: "InvalidNegative", amount: -10 },
        { type: "expense", title: "InvalidType", amount: "1e3" },
      ])
    );

    renderDocument(indexHtml);
    mockBrowserApis();
    await import(modulePath("i18n.js"));
    await import(modulePath("chart.js"));
    await import(modulePath("budget.js"));

    expect(document.querySelector("#all .list").textContent).toContain("Valid : $10.00");
    expect(document.querySelector("#all .list").textContent).not.toContain("InvalidNegative");
    expect(document.querySelector("#all .list").textContent).not.toContain("InvalidType");
  });
});

describe("internationalization and compliance UI", () => {
  it("switches the app between English and Chinese", async () => {
    await loadBudgetApp();

    expect(document.documentElement.lang).toBe("en");
    expect(document.querySelector(".dash-title").textContent).toBe("Dashboard");

    document.querySelector('[data-lang-option="zh"]').click();

    expect(document.documentElement.lang).toBe("zh-CN");
    expect(document.querySelector(".dash-title").textContent).toBe("仪表盘");
    expect(document.querySelector("#income-title-input").placeholder).toBe("标题");
  });

  it("shows the cookie banner until the user accepts it", async () => {
    await loadBudgetApp();

    const banner = document.querySelector("[data-cookie-banner]");
    expect(banner.classList.contains("hide")).toBe(false);

    document.querySelector("[data-cookie-accept]").click();

    expect(localStorage.getItem("budget_cookie_consent")).toBe("accepted");
    expect(banner.classList.contains("hide")).toBe(true);
  });

  it("translates the privacy policy page", async () => {
    await loadPrivacyPage();

    expect(document.querySelector("[data-i18n='privacyTitle']").textContent).toBe("Privacy Policy");
    expect(document.body.textContent).toContain("will not store any data to any server");

    document.querySelector('[data-lang-option="zh"]').click();

    expect(document.querySelector("[data-i18n='privacyTitle']").textContent).toBe("隐私政策");
    expect(document.body.textContent).toContain("不会把任何数据存储到服务器");
  });
});

describe("chart rendering", () => {
  it("initializes the chart canvas with a translated accessible label", async () => {
    await loadBudgetApp();

    const canvas = document.querySelector(".chart canvas");
    expect(canvas).not.toBeNull();
    expect(canvas.getAttribute("aria-label")).toBe("Income and expense chart");

    document.querySelector('[data-lang-option="zh"]').click();
    expect(canvas.getAttribute("aria-label")).toBe("收入和支出图表");
  });
});
