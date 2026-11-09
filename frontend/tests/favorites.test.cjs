const assert = require('node:assert/strict');
const test = require('node:test');

const {
  isFavorite,
  readFavoriteIds,
  toggleFavorite,
} = require('../src/services/api/favoritos.service.ts');

const FAVORITES_STORAGE_KEY = 'origem:favorites';

let storage;

test.beforeEach(() => {
  const values = new Map();
  storage = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
  global.window = {};
  global.localStorage = storage;
});

test('favorita uma obra e disponibiliza o identificador para a lista de favoritos', () => {
  assert.deepEqual(readFavoriteIds(), []);
  assert.equal(isFavorite('product-1'), false);

  const favoriteIds = toggleFavorite('product-1');

  assert.deepEqual(favoriteIds, ['product-1']);
  assert.deepEqual(readFavoriteIds(), ['product-1']);
  assert.equal(isFavorite('product-1'), true);
  assert.equal(storage.getItem(FAVORITES_STORAGE_KEY), '["product-1"]');
});

test('alterna favoritos sem duplicar IDs e remove apenas a obra desmarcada', () => {
  toggleFavorite('product-1');
  toggleFavorite('product-2');

  assert.deepEqual(toggleFavorite('product-1'), ['product-2']);
  assert.equal(isFavorite('product-1'), false);
  assert.equal(isFavorite('product-2'), true);

  assert.deepEqual(toggleFavorite('product-2'), []);
  assert.deepEqual(readFavoriteIds(), []);
});
