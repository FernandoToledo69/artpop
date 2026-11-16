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
  updateProduct,
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
  weightKg: '1.2',
  lengthCm: '20',
  widthCm: '20',
  heightCm: '30',
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
    ['origem:artisan-profile:guest', JSON.stringify({ name: 'Stefani Germanotta', email: 'ana.lima@email.com', city: 'Recife' })],
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
    get length() {
      return values.size;
    },
    key(index) {
      return Array.from(values.keys())[index] ?? null;
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
    weightKg: '',
    lengthCm: '0',
    widthCm: 'abc',
    heightCm: '-1',
    description: 'Curta',
    mainImage: '',
  });

  assert.deepEqual(Object.keys(errors).sort(), [
    'category',
    'description',
    'heightCm',
    'lengthCm',
    'mainImage',
    'price',
    'stock',
    'technique',
    'title',
    'weightKg',
    'widthCm',
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
  assert.equal(createdProduct.weightKg, 1.2);
  assert.equal(createdProduct.lengthCm, 20);
  assert.equal(createdProduct.widthCm, 20);
  assert.equal(createdProduct.heightCm, 30);
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

test('migra obras antigas com medidas estimadas por categoria e não associa dados pessoais', () => {
  const { weightKg, lengthCm, widthCm, heightCm, ...legacyDraft } = draft;
  storage.setItem('origem:products', JSON.stringify([{
    ...legacyDraft,
    id: 'legacy-product',
    price: 125.5,
    stock: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    artisanCity: 'Recife',
  }]));

  const legacyProduct = readProducts().find((product) => product.id === 'legacy-product');

  assert.equal(legacyProduct.artisanName, 'Artesão');
  assert.equal(legacyProduct.artisanCity, 'Recife');
  assert.equal(legacyProduct.weightKg, 1.2);
  assert.equal(legacyProduct.lengthCm, 20);
  assert.equal(legacyProduct.widthCm, 20);
  assert.equal(legacyProduct.heightCm, 30);
  assert.equal(legacyProduct.shippingMeasurementsEstimated, true);
  assert.deepEqual(JSON.parse(storage.getItem('origem:products'))[0], legacyProduct);
});

test('preenche apenas as medidas ausentes e preserva as medidas válidas existentes', () => {
  storage.setItem('origem:products', JSON.stringify([{
    ...draft,
    id: 'partially-measured',
    price: 125.5,
    stock: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    artisanCity: 'Recife',
    weightKg: 2.4,
    lengthCm: 0,
    widthCm: 24,
    heightCm: undefined,
  }]));

  const product = readProducts()[0];

  assert.equal(product.weightKg, 2.4);
  assert.equal(product.lengthCm, 20);
  assert.equal(product.widthCm, 24);
  assert.equal(product.heightCm, 30);
  assert.equal(product.shippingMeasurementsEstimated, true);
});

test('permite substituir as medidas estimadas de uma obra legada', () => {
  const { weightKg, lengthCm, widthCm, heightCm, ...legacyDraft } = draft;
  storage.setItem('origem:products', JSON.stringify([{
    ...legacyDraft,
    id: 'legacy-product',
    price: 125.5,
    stock: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    artisanCity: 'Recife',
    artisanId: 'artisan-123',
  }]));

  const updatedProduct = updateProduct(
    'legacy-product',
    { ...draft, weightKg: '0.8', lengthCm: '25', widthCm: '18', heightCm: '12' },
  );

  assert.equal(updatedProduct.weightKg, 0.8);
  assert.equal(updatedProduct.lengthCm, 25);
  assert.equal(updatedProduct.widthCm, 18);
  assert.equal(updatedProduct.heightCm, 12);
  assert.equal(updatedProduct.shippingMeasurementsEstimated, false);
  assert.equal(readProducts().find((product) => product.id === 'legacy-product').weightKg, 0.8);
});

test('as obras de demonstração possuem dados de peso e dimensões para envio', () => {
  assert.ok(readCatalogProducts().every((product) => (
    product.weightKg > 0
    && product.lengthCm > 0
    && product.widthCm > 0
    && product.heightCm > 0
  )));
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
  assert.equal(JSON.parse(storage.getItem('origem:orders:buyer-1') ?? '[]').length, 0);
});

test('identifica o artesão dono e não permite que ele compre a própria obra', async () => {
  const product = await createProduct(draft, 'artisan-123');
  const artisan = { id: 'user-123', artisanId: 'artisan-123', name: 'Stefani Germanotta', role: 'artisan' };
  const otherArtisan = { ...artisan, id: 'user-456', artisanId: 'artisan-456', name: 'Outra pessoa' };

  assert.equal(isProductOwner(product, artisan), true);
  assert.equal(isProductOwner(product, otherArtisan), false);
  assert.equal(isProductOwner({ ...product, artisanId: undefined }, artisan), false);
  assert.equal(isProductOwner(product, { ...artisan, role: 'buyer' }), false);
  assert.deepEqual(addToCart(product, artisan), []);

  addToCart(product, null);
  storage.setItem('origem:session', JSON.stringify({ ...artisan, expiresAt: Date.now() + 60_000 }));
  assert.equal(createOrder({ brand: 'Pix', last4: 'PIX' }), null);
  assert.equal(JSON.parse(storage.getItem('origem:orders:user-123') ?? '[]').length, 0);
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
  storage.setItem('origem:artisan-profile:guest', JSON.stringify({
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
