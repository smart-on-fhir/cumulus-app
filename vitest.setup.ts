import '@testing-library/jest-dom';

// jsdom doesn't implement CSS.supports, but Highcharts v13 requires it
if (typeof CSS === 'undefined') {
  (globalThis as any).CSS = { supports: () => false }
} else if (typeof CSS.supports === 'undefined') {
  (CSS as any).supports = () => false
}