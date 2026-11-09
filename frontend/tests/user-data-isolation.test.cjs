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

const { readCart } = require('../src/services/api/carrinho.service.ts');
const { applyCoupon, readAppliedCoupon } = require('../src/services/api/cupons.service.ts');
const {
  readAllOrders,
  readOrders,
  updateOrderStatus,
} = require('../src/services/api/pedidos.service.ts');
const {
  readShippingSelection,
  saveShippingSelection,
} = require('../src/services/api/carrinho.service.ts');

const SESSION_STORAGE_KEY = 'origem:session';
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

function setCurrentUser(id) {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    id,
    name: id,
    email: `${id}@example.test`,
    role: 'buyer',
    expiresAt: Date.now() + 60_000,
  }));
}

test('mantém carrinho, frete e cupom separados entre contas', () => {
  setCurrentUser('buyer-1');
  storage.setItem('origem:cart:buyer-1', JSON.stringify([{ id: 'item-1', quantity: 1 }]));
  const shipping = {
    id: 'PAC',
    name: 'PAC',
    description: 'Entrega econômica',
    price: 20,
    deliveryTime: '8 a 12 dias úteis',
  };
  saveShippingSelection(shipping);
  applyCoupon('ARTPOP10');

  setCurrentUser('buyer-2');
  assert.deepEqual(readCart(), []);
  assert.equal(readShippingSelection(), null);
  assert.equal(readAppliedCoupon(), null);

  setCurrentUser('buyer-1');
  assert.deepEqual(readCart(), [{ id: 'item-1', quantity: 1 }]);
  assert.deepEqual(readShippingSelection(), shipping);
  assert.equal(readAppliedCoupon().code, 'ARTPOP10');
});

test('isola o histórico de pedidos do comprador e limita a atualização ao pedido escolhido', () => {
  const buyerOneOrder = { id: 'order-1', status: 'Pendente' };
  const buyerTwoOrder = { id: 'order-2', status: 'Pendente' };
  storage.setItem('origem:orders:buyer-1', JSON.stringify([buyerOneOrder]));
  storage.setItem('origem:orders:buyer-2', JSON.stringify([buyerTwoOrder]));

  setCurrentUser('buyer-1');
  assert.deepEqual(readOrders(), [buyerOneOrder]);
  updateOrderStatus('order-1', 'Enviado');
  assert.deepEqual(readOrders(), [{ ...buyerOneOrder, status: 'Enviado' }]);

  setCurrentUser('buyer-2');
  assert.deepEqual(readOrders(), [buyerTwoOrder]);
  assert.equal(readAllOrders().length, 2);
});
