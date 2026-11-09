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
  deletePaymentProfile,
  formatCardExpiry,
  readPaymentProfile,
  savePaymentProfile,
  tokenizeCard,
} = require('../src/services/api/pedidos.service.ts');

const PAYMENT_PROFILE_KEY = 'origem:payment-profile:guest';
const SESSION_STORAGE_KEY = 'origem:session';

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

function setCurrentUser(id) {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    id,
    name: id,
    email: `${id}@example.test`,
    role: 'buyer',
    expiresAt: Date.now() + 60_000,
  }));
}

test('valida o cartão, salva o token no perfil e não persiste número ou código de segurança', async () => {
  const paymentProfile = await tokenizeCard({
    cardholderName: 'Ana Lima',
    cardNumber: '4111 1111 1111 1111',
    expiryDate: '12/30',
    securityCode: '123',
  });

  savePaymentProfile(paymentProfile);

  assert.equal(paymentProfile.brand, 'Visa');
  assert.equal(paymentProfile.last4, '1111');
  assert.match(paymentProfile.token, /^tok_/);
  assert.deepEqual(readPaymentProfile(), paymentProfile);

  const savedValue = storage.getItem(PAYMENT_PROFILE_KEY);
  assert.ok(savedValue);
  assert.equal(savedValue.includes('4111 1111 1111 1111'), false);
  assert.equal(savedValue.includes('"securityCode"'), false);
  assert.equal(savedValue.includes('"cardNumber"'), false);
});

test('rejeita número de cartão inválido sem vincular dados ao perfil', async () => {
  await assert.rejects(
    tokenizeCard({
      cardholderName: 'Ana Lima',
      cardNumber: '4111 1111 1111 1112',
      expiryDate: '12/30',
      securityCode: '123',
    }),
    { message: 'Confira o número do cartão.' },
  );

  assert.equal(readPaymentProfile(), null);
});

test('permite tokenizar um cartão sem salvá-lo no perfil', async () => {
  const paymentProfile = await tokenizeCard({
    cardholderName: 'Ana Lima',
    cardNumber: '4111 1111 1111 1111',
    expiryDate: '12/30',
    securityCode: '123',
  });

  assert.match(paymentProfile.token, /^tok_/);
  assert.equal(readPaymentProfile(), null);
});

test('formata a validade como MM/AA e limita a quatro dígitos', () => {
  assert.equal(formatCardExpiry('1'), '1');
  assert.equal(formatCardExpiry('123'), '12/3');
  assert.equal(formatCardExpiry('123456'), '12/34');
  assert.equal(formatCardExpiry('12/30'), '12/30');
});

test('exclui o cartão salvo do perfil', () => {
  savePaymentProfile({
    token: 'tok_saved-card',
    brand: 'Visa',
    last4: '1111',
    updatedAt: '2026-11-09T12:00:00.000Z',
  });

  deletePaymentProfile();

  assert.equal(readPaymentProfile(), null);
  assert.equal(storage.getItem(PAYMENT_PROFILE_KEY), null);
});

test('não compartilha cartão salvo entre contas', () => {
  setCurrentUser('buyer-1');
  const paymentProfile = {
    token: 'tok_buyer-card',
    brand: 'Visa',
    last4: '1111',
    updatedAt: '2026-11-09T12:00:00.000Z',
  };
  savePaymentProfile(paymentProfile);

  setCurrentUser('buyer-2');
  assert.equal(readPaymentProfile(), null);

  setCurrentUser('buyer-1');
  assert.deepEqual(readPaymentProfile(), paymentProfile);
});
