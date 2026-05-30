export type RfmInput = {
  userId: string;
  totalSpent: number;
  orderCount: number;
  lastOrderAt: string | null;
};

export type RfmScore = RfmInput & {
  recencyDays: number | null;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  score: number;
  segment: 'vip' | 'loyal' | 'at_risk' | 'new' | 'standard';
};

export function calculateRfmScores(customers: RfmInput[], now = new Date()): RfmScore[] {
  return customers.map((customer) => {
    const recencyDays = customer.lastOrderAt
      ? Math.floor((now.getTime() - new Date(customer.lastOrderAt).getTime()) / 86400000)
      : null;
    const recencyScore =
      recencyDays == null ? 1 :
      recencyDays <= 14 ? 5 :
      recencyDays <= 30 ? 4 :
      recencyDays <= 60 ? 3 :
      recencyDays <= 120 ? 2 : 1;
    const frequencyScore =
      customer.orderCount >= 8 ? 5 :
      customer.orderCount >= 5 ? 4 :
      customer.orderCount >= 3 ? 3 :
      customer.orderCount >= 1 ? 2 : 1;
    const monetaryScore =
      customer.totalSpent >= 10000000 ? 5 :
      customer.totalSpent >= 5000000 ? 4 :
      customer.totalSpent >= 2000000 ? 3 :
      customer.totalSpent > 0 ? 2 : 1;
    const score = recencyScore + frequencyScore + monetaryScore;

    let segment: RfmScore['segment'] = 'standard';
    if (score >= 13) segment = 'vip';
    else if (frequencyScore >= 4 && recencyScore >= 3) segment = 'loyal';
    else if (customer.orderCount === 0) segment = 'new';
    else if (recencyDays != null && recencyDays >= 60 && customer.totalSpent > 0) segment = 'at_risk';

    return {
      ...customer,
      recencyDays,
      recencyScore,
      frequencyScore,
      monetaryScore,
      score,
      segment,
    };
  });
}

export function calculateRetentionRate(
  orders: Array<{ user_id: string; created_at: string; status: string }>,
  currentStart: Date,
  previousStart: Date,
  revenueStatuses = ['paid', 'confirmed', 'shipping', 'delivered']
) {
  const previous = new Set<string>();
  const retained = new Set<string>();

  for (const order of orders) {
    if (!revenueStatuses.includes(order.status)) continue;
    const createdAt = new Date(order.created_at);
    if (createdAt >= previousStart && createdAt < currentStart) {
      previous.add(order.user_id);
    }
  }

  for (const order of orders) {
    if (!revenueStatuses.includes(order.status)) continue;
    const createdAt = new Date(order.created_at);
    if (createdAt >= currentStart && previous.has(order.user_id)) {
      retained.add(order.user_id);
    }
  }

  return previous.size > 0 ? Math.round((retained.size / previous.size) * 1000) / 10 : 0;
}
