// SELECT CHART ELEMENT
const chartEl = document.querySelector(".chart");

// CREATE CANVAS ELEMENT
const canvas = document.createElement("canvas");
canvas.setAttribute("aria-label", "Income and expense chart");

chartEl.appendChild(canvas);

// TO DRAW ON CANVAS, WE NEED TO GET CONTEXT OF CANVAS
const ctx = canvas.getContext("2d");

let currentIncome = 0;
let currentOutcome = 0;
let canvasSize = 64;

function getChartSize() {
  const containerWidth = chartEl.clientWidth || 64;

  if (window.matchMedia("(min-width: 920px)").matches) {
    return Math.max(88, Math.min(120, containerWidth * 0.5));
  }

  if (window.matchMedia("(max-width: 480px)").matches) {
    return Math.max(56, Math.min(72, containerWidth * 0.7));
  }

  return Math.max(64, Math.min(88, containerWidth * 0.6));
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvasSize = Math.round(getChartSize());

  canvas.width = canvasSize * dpr;
  canvas.height = canvasSize * dpr;
  canvas.style.width = `${canvasSize}px`;
  canvas.style.height = `${canvasSize}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.lineWidth = Math.max(6, Math.round(canvasSize * 0.14));

  renderChart();
}

function getChartRadius() {
  return Math.max(12, (canvasSize - ctx.lineWidth) / 2 - 2);
}

function drawCircle(color, ratio, anticlockwise) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(
    canvasSize / 2,
    canvasSize / 2,
    getChartRadius(),
    0,
    ratio * 2 * Math.PI,
    anticlockwise
  );
  ctx.stroke();
}

function renderChart() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  const total = currentIncome + currentOutcome;
  if (total <= 0) {
    drawCircle("rgba(255, 255, 255, 0.35)", 1, false);
    return;
  }

  const ratio = currentIncome / total;

  drawCircle("#FFF", -ratio, true);
  drawCircle("#F0624D", 1 - ratio, false);
}

function updateChart(income, outcome) {
  currentIncome = income;
  currentOutcome = outcome;
  renderChart();
}

resizeCanvas();

if (typeof ResizeObserver !== "undefined") {
  const chartResizeObserver = new ResizeObserver(resizeCanvas);
  chartResizeObserver.observe(chartEl);
} else {
  window.addEventListener("resize", resizeCanvas);
}
