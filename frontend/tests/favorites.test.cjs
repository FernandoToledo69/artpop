const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const typescript = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  module._compile(outputText, filename);
};

const {
  isFavorite,
  readFavoriteIds,
  toggleFavorite,
} = require('../src/services/api/favoritos.service.ts');

const SESSION_STORAGE_KEY = 'origem:session';
const FAVORITES_STORAGE_KEY = 'origem:favorites';

let storage;
let values;

test.beforeEach(() => {
  values = new Map();
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
  setCurrentUser('buyer-1');
});

function setCurrentUser(userId) {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    id: userId,
    name: userId,
    email: `${userId}@example.test`,
    role: 'buyer',
    expiresAt: Date.now() + 60_000,
  }));
}

test('favorita uma obra e disponibiliza o identificador para a lista de favoritos', () => {
  assert.deepEqual(readFavoriteIds(), []);
  assert.equal(isFavorite('product-1'), false);

  const favoriteIds = toggleFavorite('product-1');

  assert.deepEqual(favoriteIds, ['product-1']);
  assert.deepEqual(readFavoriteIds(), ['product-1']);
  assert.equal(isFavorite('product-1'), true);
  assert.equal(storage.getItem(`${FAVORITES_STORAGE_KEY}:buyer-1`), '["product-1"]');
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

test('mantém favoritos separados ao alternar entre usuários autenticados', () => {
  setCurrentUser('admin-1');
  toggleFavorite('admin-favorite');

  setCurrentUser('artisan-1');
  assert.deepEqual(readFavoriteIds(), []);
  assert.equal(isFavorite('admin-favorite'), false);
  toggleFavorite('artisan-favorite');

  setCurrentUser('admin-1');
  assert.deepEqual(readFavoriteIds(), ['admin-favorite']);
  assert.equal(isFavorite('artisan-favorite'), false);

  setCurrentUser('artisan-1');
  assert.deepEqual(readFavoriteIds(), ['artisan-favorite']);
});

test('não associa favoritos antigos sem proprietário à conta atual', () => {
  storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(['legacy-favorite']));

  assert.deepEqual(readFavoriteIds(), []);
  assert.equal(isFavorite('legacy-favorite'), false);
});
