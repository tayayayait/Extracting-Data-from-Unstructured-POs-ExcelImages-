import { roundCurrency, parseDimensions, calculateWeight, calculateTotalAmount } from '../src/lib/calculator';

const assert = require('assert');

console.log('--- Testing Calculator Utilities ---');

// Test Rounding
assert.strictEqual(roundCurrency(10.4), 10);
assert.strictEqual(roundCurrency(10.5), 11);
assert.strictEqual(roundCurrency(10.55, 1), 10.6);
assert.strictEqual(roundCurrency('10.5'), 11);
console.log('[OK] roundCurrency works accurately without JS float issues.');

// Test Dimension Parsing
assert.deepStrictEqual(parseDimensions('30*60*90'), [30, 60, 90]);
assert.deepStrictEqual(parseDimensions('30x60'), [30, 60, 0]);
assert.deepStrictEqual(parseDimensions('30 X 60 X 10'), [30, 60, 10]);
assert.deepStrictEqual(parseDimensions('INVALID'), [0, 0, 0]);
console.log('[OK] parseDimensions correctly extracts W, D, H.');

// Test Weight Calculation
// e.g., 30 * 60 * 10 mm = 18000 mm^3 = 0.018 L * 7.85 = 0.1413 kg
assert.strictEqual(calculateWeight(30, 60, 10, 7.85), 0.141);
// Testing fallback default height of 1
assert.strictEqual(calculateWeight(30, 60, 0, 7.85), 0.014); // 30*60*1 * 7.85 / 1000000 = 0.01413 -> 0.014
console.log('[OK] calculateWeight accurately returns floating kg constraints.');

// Test Total Amount
assert.strictEqual(calculateTotalAmount(3, 100.33), 301); // 300.99 -> 301
console.log('[OK] calculateTotalAmount handles floating edge cases gracefully.');

console.log('ALL Unit tests passed!');
