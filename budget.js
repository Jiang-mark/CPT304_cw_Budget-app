//SELECT ELEMENTS
const balanceEl = document.querySelector(".balance .value");
const incomeTotalEl = document.querySelector(".income-total");
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");

//SELECT BUTTONS
const expenseBtn = document.querySelector(".first-tab");
const incomeBtn = document.querySelector(".second-tab");
const allBtn = document.querySelector(".third-tab");

//INPUT BTS
const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");

const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");

//VARIABLES
let ENTRY_LIST;
let balance = 0,
  income = 0,
  outcome = 0;
const DELETE = "delete",
  EDIT = "edit";
const AMOUNT_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

// LOOK IF THERE IS DATA IN LOCAL STORAGE
ENTRY_LIST = getStoredEntries();
updateUI();

//EVENT LISTENERS
expenseBtn.addEventListener("click", function () {
  show(expenseEl);
  hide([incomeEl, allEl]);
  active(expenseBtn);
  inactive([incomeBtn, allBtn]);
});
incomeBtn.addEventListener("click", function () {
  show(incomeEl);
  hide([expenseEl, allEl]);
  active(incomeBtn);
  inactive([expenseBtn, allBtn]);
});
allBtn.addEventListener("click", function () {
  show(allEl);
  hide([incomeEl, expenseEl]);
  active(allBtn);
  inactive([incomeBtn, expenseBtn]);
});

addExpense.addEventListener("click", function () {
  // CHECK IF ONE OF THE INPUT IS EMPTY => EXIT
  if (!expenseTitle.value) return;

  const amount = getValidAmount(expenseAmount);
  if (amount === null) return;

  // ADD INPUTs TO ENTRY_LIST
  let expense = {
    type: "expense",
    title: expenseTitle.value,
    amount,
  };
  ENTRY_LIST.push(expense);

  updateUI();
  clearInput([expenseTitle, expenseAmount]);
});

addIncome.addEventListener("click", function () {
  // CHECK IF ONE OF THE INPUT IS EMPTY => EXIT
  if (!incomeTitle.value) return;

  const amount = getValidAmount(incomeAmount);
  if (amount === null) return;

  // ADD INPUTs TO ENTRY_LIST
  let income = {
    type: "income",
    title: incomeTitle.value,
    amount,
  };
  ENTRY_LIST.push(income);

  updateUI();
  clearInput([incomeTitle, incomeAmount]);
});

incomeList.addEventListener("click", deleteOrEdit);
expenseList.addEventListener("click", deleteOrEdit);
allList.addEventListener("click", deleteOrEdit);
window.addEventListener("languagechange", updateUI);

// HELEPER FUNCS
function deleteOrEdit(event) {
  const targetBtn = event.target;
  const entry = targetBtn.parentNode;

  if (targetBtn.id == EDIT) {
    editEntry(entry);
  } else if (targetBtn.id == DELETE) {
    deleteEntry(entry);
  }
}

function deleteEntry(entry) {
  ENTRY_LIST.splice(entry.id, 1);
  updateUI();
}

function editEntry(entry) {
  const ENTRY = ENTRY_LIST[entry.id];

  if (ENTRY.type == "income") {
    incomeTitle.value = ENTRY.title;
    incomeAmount.value = ENTRY.amount;
  } else if (ENTRY.type == "expense") {
    expenseTitle.value = ENTRY.title;
    expenseAmount.value = ENTRY.amount;
  }
  deleteEntry(entry);
}

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = Math.abs(calculateBalance(income, outcome));

  let sign = income >= outcome ? "$" : "-$";

  //UPDATE UI
  balanceEl.innerHTML = `<small>${sign}</small>${formatAmount(balance)}`;
  outcomeTotalEl.innerHTML = `<small>$</small>${formatAmount(outcome)}`;
  incomeTotalEl.innerHTML = `<small>$</small>${formatAmount(income)}`;

  clearElement([expenseList, incomeList, allList]);

  ENTRY_LIST.forEach((entry, index) => {
    if (entry.type == "expense") {
      showEntry(expenseList, entry.type, entry.title, entry.amount, index);
    } else if (entry.type == "income") {
      showEntry(incomeList, entry.type, entry.title, entry.amount, index);
    }
    showEntry(allList, entry.type, entry.title, entry.amount, index);
  });
  updateChart(income, outcome);
  localStorage.setItem("entry_list", JSON.stringify(ENTRY_LIST));
}

function showEntry(list, type, title, amount, id) {
  const li = document.createElement("li");
  li.id = id;
  li.className = type;

  const entryDiv = document.createElement("div");
  entryDiv.className = "entry";
  entryDiv.textContent = `${title} : $${formatAmount(amount)}`;

  const editDiv = document.createElement("button");
  editDiv.id = "edit";
  editDiv.type = "button";
  editDiv.setAttribute("aria-label", translate("editEntry"));

  const deleteDiv = document.createElement("button");
  deleteDiv.id = "delete";
  deleteDiv.type = "button";
  deleteDiv.setAttribute("aria-label", translate("deleteEntry"));

  li.appendChild(entryDiv);
  li.appendChild(editDiv);
  li.appendChild(deleteDiv);

  list.insertAdjacentElement("afterbegin", li);
}

function clearElement(elements) {
  elements.forEach((element) => {
    element.innerHTML = "";
  });
}

function calculateTotal(type, list) {
  let totalInCents = 0;
  list.forEach((entry) => {
    if (entry.type == type) {
      totalInCents += Math.round(entry.amount * 100);
    }
  });
  return totalInCents / 100;
}

function calculateBalance(income, outcome) {
  return income - outcome;
}

function getValidAmount(amountInput) {
  const rawAmount = amountInput.value.trim();
  const amount = Number(rawAmount);

  if (!isValidAmount(rawAmount)) {
    amountInput.setCustomValidity(translate("amountValidationMessage"));
    amountInput.reportValidity();
    return null;
  }

  amountInput.setCustomValidity("");
  return Number(amount.toFixed(2));
}

function getStoredEntries() {
  let storedEntries = [];

  try {
    storedEntries = JSON.parse(localStorage.getItem("entry_list")) || [];
  } catch (error) {
    storedEntries = [];
  }

  if (!Array.isArray(storedEntries)) {
    return [];
  }

  return storedEntries.filter((entry) => {
    return (
      entry &&
      (entry.type == "income" || entry.type == "expense") &&
      typeof entry.title == "string" &&
      isValidAmount(String(entry.amount))
    );
  });
}

function isValidAmount(value) {
  const rawAmount = value.trim();
  const amount = Number(rawAmount);

  return AMOUNT_PATTERN.test(rawAmount) && Number.isFinite(amount) && amount > 0;
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function translate(key) {
  return window.i18n ? window.i18n.t(key) : key;
}

function clearInput(inputs) {
  inputs.forEach((input) => {
    input.value = "";
    input.setCustomValidity("");
  });
}

function show(element) {
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach((element) => {
    element.classList.add("hide");
  });
}

function active(element) {
  element.classList.add("focus");
}
function inactive(elements) {
  elements.forEach((element) => {
    element.classList.remove("focus");
  });
}
