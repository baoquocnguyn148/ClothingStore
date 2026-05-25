import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FormulaEvaluator,
  type OrderContext,
  type PromoRule,
} from '../lib/server/promotion/formula.evaluator';

const context: OrderContext = {
  subtotal: 800_000,
  item_count: 3,
  membership_tier: 'gold',
  category_ids: ['tops', 'accessories'],
  product_ids: ['polo-shirt', 'cap'],
};

test('percentage promotion respects max discount', () => {
  const rule: PromoRule = {
    logic: 'AND',
    conditions: [{ field: 'subtotal', op: '>=', value: 500_000 }],
    action: { type: 'percentage', value: 25, max_discount: 120_000 },
  };

  assert.deepEqual(FormulaEvaluator.evaluate(rule, context), {
    isValid: true,
    discountAmount: 120_000,
    isFreeShipping: false,
  });
});

test('fixed promotion cannot discount more than subtotal', () => {
  const rule: PromoRule = {
    logic: 'AND',
    conditions: [],
    action: { type: 'fixed_amount', value: 1_000_000 },
  };

  assert.equal(
    FormulaEvaluator.evaluate(rule, context).discountAmount,
    context.subtotal
  );
});

test('OR rules match membership or product conditions', () => {
  const rule: PromoRule = {
    logic: 'OR',
    conditions: [
      { field: 'membership_tier', op: '=', value: 'silver' },
      { field: 'product_ids', op: 'in', value: ['cap', 'bag'] },
    ],
    action: { type: 'free_shipping', value: 0 },
  };

  assert.deepEqual(FormulaEvaluator.evaluate(rule, context), {
    isValid: true,
    discountAmount: 0,
    isFreeShipping: true,
  });
});

test('not_in condition rejects blocked categories', () => {
  const rule: PromoRule = {
    logic: 'AND',
    conditions: [
      { field: 'category_ids', op: 'not_in', value: ['accessories'] },
    ],
    action: { type: 'percentage', value: 10 },
  };

  assert.deepEqual(FormulaEvaluator.evaluate(rule, context), {
    isValid: false,
    discountAmount: 0,
    isFreeShipping: false,
  });
});

test('unknown condition fields fail closed', () => {
  const rule: PromoRule = {
    logic: 'AND',
    conditions: [{ field: 'coupon_source', op: '=', value: 'email' }],
    action: { type: 'fixed_amount', value: 50_000 },
  };

  assert.equal(FormulaEvaluator.evaluate(rule, context).isValid, false);
});
