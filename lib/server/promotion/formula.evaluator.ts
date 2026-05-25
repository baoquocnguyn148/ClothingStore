export interface PromoCondition {
  field: string;
  op: '>=' | '<=' | '=' | '!=' | 'in' | 'not_in';
  value: any;
}

export interface PromoRule {
  conditions: PromoCondition[];
  logic: 'AND' | 'OR';
  action: {
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    max_discount?: number;
  };
}

export interface OrderContext {
  subtotal: number;
  item_count: number;
  membership_tier: string;
  category_ids: string[];
  product_ids: string[];
}

export class FormulaEvaluator {
  static evaluate(rule: PromoRule, context: OrderContext): { isValid: boolean; discountAmount: number; isFreeShipping: boolean } {
    let isValid = false;

    if (!rule.conditions || rule.conditions.length === 0) {
      isValid = true;
    } else {
      const results = rule.conditions.map(cond => this.evaluateCondition(cond, context));
      
      if (rule.logic === 'OR') {
        isValid = results.some(r => r === true);
      } else {
        // Default to AND
        isValid = results.every(r => r === true);
      }
    }

    if (!isValid) {
      return { isValid: false, discountAmount: 0, isFreeShipping: false };
    }

    let discountAmount = 0;
    let isFreeShipping = false;

    switch (rule.action.type) {
      case 'percentage':
        discountAmount = Math.floor(context.subtotal * (rule.action.value / 100));
        if (rule.action.max_discount) {
          discountAmount = Math.min(discountAmount, rule.action.max_discount);
        }
        break;
      case 'fixed_amount':
        discountAmount = Math.min(rule.action.value, context.subtotal);
        break;
      case 'free_shipping':
        isFreeShipping = true;
        break;
    }

    return { isValid: true, discountAmount, isFreeShipping };
  }

  private static evaluateCondition(cond: PromoCondition, context: OrderContext): boolean {
    const ctxValue = (context as any)[cond.field];

    if (ctxValue === undefined) return false;

    switch (cond.op) {
      case '>=':
        return ctxValue >= cond.value;
      case '<=':
        return ctxValue <= cond.value;
      case '=':
        return ctxValue === cond.value;
      case '!=':
        return ctxValue !== cond.value;
      case 'in':
        if (Array.isArray(ctxValue)) {
          // If context is an array (like category_ids), check if ANY intersect
          if (Array.isArray(cond.value)) {
            return ctxValue.some(v => cond.value.includes(v));
          }
          return ctxValue.includes(cond.value);
        }
        if (Array.isArray(cond.value)) {
          return cond.value.includes(ctxValue);
        }
        return false;
      case 'not_in':
        if (Array.isArray(ctxValue)) {
          if (Array.isArray(cond.value)) {
            return !ctxValue.some(v => cond.value.includes(v));
          }
          return !ctxValue.includes(cond.value);
        }
        if (Array.isArray(cond.value)) {
          return !cond.value.includes(ctxValue);
        }
        return true;
      default:
        return false;
    }
  }
}
