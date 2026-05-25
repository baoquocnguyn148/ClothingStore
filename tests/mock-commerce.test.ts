import assert from 'node:assert/strict';
import test from 'node:test';
import { MockCommerceClient } from '../lib/commerce/mock-client';

const commerce = new MockCommerceClient();

test('mock catalog filters products by query and collection', async () => {
  const [queryResults, collectionResults] = await Promise.all([
    commerce.getProducts({ query: 'corduroy' }),
    commerce.getProducts({ collectionHandle: 'sakura' }),
  ]);

  assert.ok(queryResults.length > 0);
  assert.ok(
    queryResults.every((product) =>
      `${product.title} ${product.handle}`.toLowerCase().includes('corduroy')
    )
  );
  assert.ok(collectionResults.length > 0);
  assert.ok(
    collectionResults.every((product) =>
      product.collectionHandles.includes('sakura')
    )
  );
});

test('mock catalog only matches available sizes', async () => {
  const products = await commerce.getProducts({
    sizes: ['Onesize'],
    colors: ['Pink'],
  });

  assert.deepEqual(products, []);
});

test('mock catalog applies price sorting without mutating future results', async () => {
  const ascending = await commerce.getProducts({ sort: 'price-asc' });
  const descending = await commerce.getProducts({ sort: 'price-desc' });
  const unsorted = await commerce.getProducts();

  assert.ok(ascending[0].price <= ascending[ascending.length - 1].price);
  assert.ok(descending[0].price >= descending[descending.length - 1].price);
  assert.notDeepEqual(
    ascending.map((product) => product.handle),
    unsorted.map((product) => product.handle)
  );
});
