import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRetentionRate, calculateRfmScores } from '../lib/server/admin/analytics';

test('RFM scoring segments VIP and at-risk customers', () => {
  const now = new Date('2026-05-25T00:00:00.000Z');
  const scores = calculateRfmScores(
    [
      {
        userId: 'vip',
        totalSpent: 12000000,
        orderCount: 9,
        lastOrderAt: '2026-05-20T00:00:00.000Z',
      },
      {
        userId: 'risk',
        totalSpent: 3000000,
        orderCount: 2,
        lastOrderAt: '2026-02-01T00:00:00.000Z',
      },
      {
        userId: 'new',
        totalSpent: 0,
        orderCount: 0,
        lastOrderAt: null,
      },
    ],
    now
  );

  assert.equal(scores.find((score) => score.userId === 'vip')?.segment, 'vip');
  assert.equal(scores.find((score) => score.userId === 'risk')?.segment, 'at_risk');
  assert.equal(scores.find((score) => score.userId === 'new')?.segment, 'new');
});

test('retention rate counts previous-period buyers who return in current period', () => {
  const retention = calculateRetentionRate(
    [
      { user_id: 'a', status: 'paid', created_at: '2026-04-15T00:00:00.000Z' },
      { user_id: 'a', status: 'paid', created_at: '2026-05-10T00:00:00.000Z' },
      { user_id: 'b', status: 'paid', created_at: '2026-04-20T00:00:00.000Z' },
      { user_id: 'c', status: 'paid', created_at: '2026-05-11T00:00:00.000Z' },
      { user_id: 'd', status: 'cancelled', created_at: '2026-04-18T00:00:00.000Z' },
    ],
    new Date('2026-05-01T00:00:00.000Z'),
    new Date('2026-04-01T00:00:00.000Z')
  );

  assert.equal(retention, 50);
});
