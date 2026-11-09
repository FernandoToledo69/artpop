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
  appendAdditionalImages,
  selectAdditionalImageFiles,
  validateProductDraft,
} = require('../src/components/forms/product-announcement.ts');
const {
  createProduct,
  readCatalogProducts,
  readProducts,
} = require('../src/services/api/produtos.service.ts');

const draft = {
  title: 'Vaso Brisa do Sertão',
  category: 'ceramica',
  technique: 'Modelagem manual',
  price: '125.50',
  stock: '2',
  description: 'Peça artesanal feita à mão com acabamento natural.',
  mainImage: 'data:image/png;base64,main-image',
  additionalImages: [
    'data:image/png;base64,detail-one',
    'data:image/png;base64,detail-two',
    'data:image/png;base64,detail-three',
  ],
};

let storage;

test.beforeEach(() => {
  const values = new Map([
    ['origem:artisan-profile', JSON.stringify({ city: 'Recife' })],
  ]);
  storage = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
  global.window = {};
  global.localStorage = storage;
});

test('valida os campos obrigatórios e aceita uma obra completa com foto principal', () => {
  assert.deepEqual(validateProductDraft(draft), {});
  const errors = validateProductDraft({
    ...draft,
    title: ' ',
    category: '',
    technique: '',
    price: '0',
    stock: '0',
    description: 'Curta',
    mainImage: '',
  });

  assert.deepEqual(Object.keys(errors).sort(), [
    'category',
    'description',
    'mainImage',
    'price',
    'stock',
    'technique',
    'title',
  ]);
});

test('acumula até quatro imagens adicionais em seleções separadas e ignora arquivos que não sejam imagens', () => {
  const files = [
    new File([], 'one.png', { type: 'image/png' }),
    new File([], 'notes.txt', { type: 'text/plain' }),
    new File([], 'two.jpg', { type: 'image/jpeg' }),
    new File([], 'three.png', { type: 'image/png' }),
    new File([], 'four.jpg', { type: 'image/jpeg' }),
  ];

  const firstSelection = selectAdditionalImageFiles(files.slice(0, 3));
  const secondSelection = selectAdditionalImageFiles(files.slice(3), firstSelection.length);
  const firstBatch = appendAdditionalImages([], firstSelection.map((file) => file.name));
  const combinedImages = appendAdditionalImages(firstBatch, secondSelection.map((file) => file.name));

  assert.deepEqual(combinedImages, ['one.png', 'two.jpg', 'three.png', 'four.jpg']);
  assert.deepEqual(selectAdditionalImageFiles(files, 4), []);
});

test('publica e disponibiliza no catálogo a obra com suas quatro imagens', async () => {
  const createdProduct = await createProduct(draft);
  const catalogProduct = readCatalogProducts().find((product) => product.id === createdProduct.id);

  assert.ok(catalogProduct);
  assert.equal(createdProduct.title, draft.title);
  assert.equal(createdProduct.price, 125.5);
  assert.equal(createdProduct.stock, 2);
  assert.equal(createdProduct.artisanCity, 'Recife');
  assert.equal(createdProduct.artisanName, 'Stefani Germanotta');
  assert.equal(catalogProduct.mainImage, draft.mainImage);
  assert.deepEqual(catalogProduct.additionalImages, draft.additionalImages);
  assert.equal([catalogProduct.mainImage, ...catalogProduct.additionalImages].length, 4);
  assert.ok(readProducts().some(
    (product) => product.id === createdProduct.id && product.artisanName === 'Stefani Germanotta',
  ));
  assert.equal(storage.getItem('origem:products') !== null, true);
});

test('associa ao perfil atual as obras antigas que não tinham artesão gravado', () => {
  storage.setItem('origem:products', JSON.stringify([{
    ...draft,
    id: 'legacy-product',
    price: 125.5,
    stock: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    artisanCity: 'Recife',
  }]));

  const legacyProduct = readProducts().find((product) => product.id === 'legacy-product');

  assert.equal(legacyProduct.artisanName, 'Stefani Germanotta');
});
