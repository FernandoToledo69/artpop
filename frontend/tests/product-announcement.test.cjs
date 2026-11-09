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
  deleteProduct,
  isProductOwner,
  readCatalogProducts,
  readProducts,
  updateProductStock,
} = require('../src/services/api/produtos.service.ts');
const { addToCart, readCart } = require('../src/services/api/carrinho.service.ts');
const { createOrder } = require('../src/services/api/pedidos.service.ts');
const {
  filterProductsByMunicipality,
  municipalities,
  sortProductsByOrder,
} = require('../src/components/marketplace/marketplace-filters.ts');

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
  global.window = { dispatchEvent() {} };
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

test('exclui permanentemente a obra e suas informações sem afetar outras publicações', async () => {
  const productToDelete = await createProduct(draft);
  const productToKeep = await createProduct({ ...draft, title: 'Outra obra' });

  deleteProduct(productToDelete.id);

  assert.equal(readProducts().some((product) => product.id === productToDelete.id), false);
  assert.equal(readCatalogProducts().some((product) => product.id === productToDelete.id), false);
  assert.equal(readProducts().some((product) => product.id === productToKeep.id), true);

  const persistedProducts = JSON.parse(storage.getItem('origem:products'));
  assert.equal(persistedProducts.some((product) => product.id === productToDelete.id), false);
  assert.equal(persistedProducts.length, 1);
});

test('salva estoque zero e impede adicionar a obra esgotada ao carrinho', async () => {
  const product = await createProduct(draft, 'artisan-123');

  addToCart(product, null);
  const updatedProduct = updateProductStock(product.id, 0);
  const catalogProduct = readCatalogProducts().find((item) => item.id === product.id);
  const cartAfterAttempt = addToCart(product, null);

  assert.equal(updatedProduct.stock, 0);
  assert.equal(catalogProduct.stock, 0);
  assert.equal(JSON.parse(storage.getItem('origem:products'))[0].stock, 0);
  assert.equal(cartAfterAttempt[0].quantity, 1);
  assert.equal(readCart()[0].quantity, 1);

  storage.setItem('origem:session', JSON.stringify({ id: 'buyer-1', expiresAt: Date.now() + 60_000 }));
  assert.equal(createOrder({ brand: 'Pix', last4: 'PIX' }), null);
  assert.equal(JSON.parse(storage.getItem('origem:orders') ?? '[]').length, 0);
});

test('identifica o artesão dono e não permite que ele compre a própria obra', async () => {
  const product = await createProduct(draft, 'artisan-123');
  const artisan = { id: 'user-123', artisanId: 'artisan-123', name: 'Stefani Germanotta', role: 'artisan' };
  const otherArtisan = { ...artisan, id: 'user-456', artisanId: 'artisan-456', name: 'Outra pessoa' };

  assert.equal(isProductOwner(product, artisan), true);
  assert.equal(isProductOwner(product, otherArtisan), false);
  assert.equal(isProductOwner(product, { ...artisan, role: 'buyer' }), false);
  assert.deepEqual(addToCart(product, artisan), []);

  addToCart(product, null);
  storage.setItem('origem:session', JSON.stringify({ ...artisan, expiresAt: Date.now() + 60_000 }));
  assert.equal(createOrder({ brand: 'Pix', last4: 'PIX' }), null);
  assert.equal(JSON.parse(storage.getItem('origem:orders') ?? '[]').length, 0);
});

test('filtra a vitrine para exibir somente obras de Caruaru', () => {
  const products = [
    { id: 'caruaru-1', artisanCity: 'Caruaru' },
    { id: 'recife-1', artisanCity: 'Recife' },
    { id: 'olinda-1', artisanCity: 'Olinda' },
  ];

  const filteredProducts = filterProductsByMunicipality(products, 'Caruaru');

  assert.ok(municipalities.includes('Caruaru'));
  assert.deepEqual(filteredProducts.map((product) => product.id), ['caruaru-1']);
  assert.deepEqual(
    filterProductsByMunicipality([{ id: 'jaboatao-1', artisanCity: 'Jaboatão dos   Guararapes' }], 'jaboatao dos guararapes')
      .map((product) => product.id),
    ['jaboatao-1'],
  );
  assert.deepEqual(filterProductsByMunicipality(products, 'Todos os municípios'), products);
});

test('inclui publicações recentes quando o município do perfil tem espaços ou variação de caixa', async () => {
  storage.setItem('origem:artisan-profile', JSON.stringify({
    name: 'Artesã de Caruaru',
    city: '  CARUARU  ',
  }));
  const product = await createProduct(draft);
  const catalogProducts = readCatalogProducts();

  assert.equal(product.artisanCity, 'CARUARU');
  assert.ok(filterProductsByMunicipality(catalogProducts, 'Caruaru').some(
    (catalogProduct) => catalogProduct.id === product.id,
  ));
});

test('ordena os anúncios do menor valor para o maior sem alterar a lista original', () => {
  const products = [
    { id: 'medium', price: 89.9 },
    { id: 'lowest', price: 12.5 },
    { id: 'highest', price: 320 },
  ];

  const sortedProducts = sortProductsByOrder(products, 'price-asc');

  assert.deepEqual(sortedProducts.map((product) => product.id), ['lowest', 'medium', 'highest']);
  assert.deepEqual(products.map((product) => product.id), ['medium', 'lowest', 'highest']);
});
