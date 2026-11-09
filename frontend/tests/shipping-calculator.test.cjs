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
  calculateShipping,
  calculateShippingTotal,
  clearShippingSelection,
  formatPostalCode,
  readShippingSelection,
  saveShippingSelection,
} = require('../src/services/api/carrinho.service.ts');

const SHIPPING_SELECTION_KEY = 'origem:shipping-selection:guest';

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
    removeItem(key) {
      values.delete(key);
    },
  };
  global.window = {};
  global.localStorage = storage;
});

test('formata o CEP como XXXXX-XXX e limita a oito dígitos', () => {
  assert.equal(formatPostalCode('01001'), '01001');
  assert.equal(formatPostalCode('01001000'), '01001-000');
  assert.equal(formatPostalCode('01001-000'), '01001-000');
  assert.equal(formatPostalCode('01001.00099'), '01001-000');
  assert.equal(formatPostalCode('abc'), '');
});

test('calcula opções e total de frete para um CEP válido', async () => {
  const quote = await calculateShipping('01001-000');

  assert.equal(quote.postalCode, '01001000');
  assert.deepEqual(quote.options.map(({ id, price, deliveryTime }) => ({ id, price, deliveryTime })), [
    { id: 'PAC', price: 21.35, deliveryTime: '8 a 12 dias úteis' },
    { id: 'SEDEX', price: 35.85, deliveryTime: '3 a 5 dias úteis' },
  ]);
  assert.equal(calculateShippingTotal(100, quote.options[0]), 121.35);
  assert.equal(calculateShippingTotal(100, quote.options[1]), 135.85);
});

test('rejeita CEP com quantidade incorreta de dígitos ou sequência repetida', async () => {
  await assert.rejects(calculateShipping('12345-67'), {
    message: 'Informe um CEP válido com 8 números.',
  });
  await assert.rejects(calculateShipping('00000-000'), {
    message: 'Informe um CEP válido com 8 números.',
  });
});

test('persiste a opção selecionada para uso no checkout e permite invalidá-la', () => {
  const pac = {
    id: 'PAC',
    name: 'PAC',
    description: 'Entrega econômica',
    price: 21.35,
    deliveryTime: '8 a 12 dias úteis',
  };
  const sedex = {
    id: 'SEDEX',
    name: 'Sedex',
    description: 'Entrega expressa',
    price: 35.85,
    deliveryTime: '3 a 5 dias úteis',
  };

  saveShippingSelection(pac);
  saveShippingSelection(sedex);
  assert.deepEqual(readShippingSelection(), sedex);

  clearShippingSelection();
  assert.equal(storage.getItem(SHIPPING_SELECTION_KEY), null);
  assert.equal(readShippingSelection(), null);
});
