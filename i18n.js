const TRANSLATIONS = {
  en: {
    acceptCookies: "Accept",
    addExpense: "Add expense",
    addIncome: "Add income",
    all: "All",
    amountPlaceholder: "$0",
    amountValidationMessage: "Please enter a positive amount with up to two decimal places.",
    balance: "Balance",
    chartLabel: "Income and expense chart",
    cookieMessage:
      "We use local storage to remember your budget entries, language preference, and cookie choice.",
    cookieTitle: "Cookie Notice",
    dashboard: "Dashboard",
    deleteEntry: "Delete this entry",
    editEntry: "Edit this entry",
    expenseAmountLabel: "Expense Amount",
    expenseTitleLabel: "Expense Title",
    expenses: "Expenses",
    income: "Income",
    incomeAmountLabel: "Income Amount",
    incomeTitleLabel: "Income Title",
    outcome: "Outcome",
    privacyBack: "Back to Budget App",
    privacyIntro:
      "This Budget App stores information locally in your browser, it will not store any data to any server.",
    privacyLink: "Privacy Policy",
    privacySectionData: "Data We Store",
    privacySectionRights: "What You Can Do",
    privacySectionUse: "How We Use Data",
    privacyTitle: "Privacy Policy",
    privacyDataText:
      "The app stores your income and expense entries, selected language, and cookie acknowledgement in localStorage on your device.",
    privacyUseText:
      "Stored data is used only to calculate and display your budget, keep your language preference, and the cookie banner will only appear if you haven't acknowledged it.",
    privacyRightsText: "You can clear the app data at any time through your browser site data settings.",
    titlePlaceholder: "title",
  },
  zh: {
    acceptCookies: "接受",
    addExpense: "添加支出",
    addIncome: "添加收入",
    all: "全部",
    amountPlaceholder: "$0",
    amountValidationMessage: "请输入大于 0 且最多保留两位小数的金额。",
    balance: "余额",
    chartLabel: "收入和支出图表",
    cookieMessage: "我们使用本地存储来保存你的预算记录、语言偏好和 Cookie 选择。",
    cookieTitle: "Cookie 提示",
    dashboard: "仪表盘",
    deleteEntry: "删除此记录",
    editEntry: "编辑此记录",
    expenseAmountLabel: "支出金额",
    expenseTitleLabel: "支出标题",
    expenses: "支出",
    income: "收入",
    incomeAmountLabel: "收入金额",
    incomeTitleLabel: "收入标题",
    outcome: "支出",
    privacyBack: "返回预算应用",
    privacyIntro: "本预算应用只会在你的浏览器本地保存信息，不会把任何数据存储到服务器。",
    privacyLink: "隐私政策",
    privacySectionData: "我们存储的数据",
    privacySectionRights: "你可以做什么",
    privacySectionUse: "数据使用方式",
    privacyTitle: "隐私政策",
    privacyDataText: "应用会在你的设备 localStorage 中保存收入和支出记录、所选语言以及 Cookie 确认状态。",
    privacyUseText: "这些数据只用于计算和展示预算、保留语言偏好；如果你已经确认过 Cookie 提示，它就不会再次显示。",
    privacyRightsText: "你可以随时通过浏览器的网站数据设置清除应用数据。",
    titlePlaceholder: "标题",
  },
};

const LANGUAGE_KEY = "budget_language";
const COOKIE_KEY = "budget_cookie_consent";

function getStoredLanguage() {
  const language = localStorage.getItem(LANGUAGE_KEY);
  return language === "zh" ? "zh" : "en";
}

function t(key) {
  const language = getStoredLanguage();
  return TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || key;
}

function translatePage() {
  const language = getStoredLanguage();
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });

  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    const isActive = button.dataset.langOption === language;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setLanguage(language) {
  localStorage.setItem(LANGUAGE_KEY, language === "zh" ? "zh" : "en");
  translatePage();
  window.dispatchEvent(new CustomEvent("languagechange"));
}

function initLanguageSwitch() {
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.langOption);
    });
  });
}

function initCookieBanner() {
  const banner = document.querySelector("[data-cookie-banner]");
  const acceptButton = document.querySelector("[data-cookie-accept]");

  if (!banner || !acceptButton) return;

  if (localStorage.getItem(COOKIE_KEY) === "accepted") {
    banner.classList.add("hide");
    return;
  }

  banner.classList.remove("hide");
  acceptButton.addEventListener("click", () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    banner.classList.add("hide");
  });
}

function initI18n() {
  translatePage();
  initLanguageSwitch();
  initCookieBanner();
}

window.i18n = {
  t,
  getLanguage: getStoredLanguage,
  setLanguage,
  translatePage,
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initI18n);
} else {
  initI18n();
}
