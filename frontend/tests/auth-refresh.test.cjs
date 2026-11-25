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

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3333';
const { apiFetch, getApiToken, setApiToken } = require('../src/services/api/client.ts');
const { SESSION_KEY } = require('../src/services/api/auth-session.ts');

let values;
let assignedPaths;

test.beforeEach(() => {
  values = new Map();
  assignedPaths = [];
  global.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: (key) => values.delete(key),
    },
    dispatchEvent: () => true,
    location: {
      pathname: '/checkout',
      assign: (path) => assignedPaths.push(path),
    },
  };
  setApiToken(null);
});

test('renova o token expirado e repete a chamada protegida', async () => {
  const requests = [];
  global.fetch = async (url, init) => {
    requests.push({ url, init });
    if (url.endsWith('/api/auth/refresh')) {
      return new Response(JSON.stringify({
        token: 'new-access-token',
        user: { id: 'user-1', name: 'Pessoa', email: 'pessoa@example.test', role: 'buyer' },
        expiresAt: Date.now() + 60_000,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (init.headers.Authorization !== 'Bearer new-access-token') {
      return new Response(JSON.stringify({ error: 'Token expirado.' }), { status: 401 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  values.set(SESSION_KEY, JSON.stringify({ id: 'user-1', role: 'buyer', expiresAt: Date.now() + 60_000 }));

  const result = await apiFetch('/api/checkout');

  assert.deepEqual(result, { ok: true });
  assert.equal(requests.length, 3);
  assert.equal(requests[1].url, 'http://localhost:3333/api/auth/refresh');
  assert.equal(requests[1].init.credentials, 'include');
  assert.equal(requests[1].init.headers.Authorization, undefined);
  assert.equal(requests[2].init.headers.Authorization, 'Bearer new-access-token');
  assert.equal(getApiToken(), 'new-access-token');
  assert.equal(assignedPaths.length, 0);
});

test('limpa a sessão e redireciona quando o refresh também expirou', async () => {
  global.fetch = async () => new Response(
    JSON.stringify({ error: 'Sessão expirada.' }),
    { status: 401 },
  );
  values.set(SESSION_KEY, JSON.stringify({ id: 'user-1', role: 'buyer', expiresAt: Date.now() + 60_000 }));

  await assert.rejects(apiFetch('/api/checkout'), /Sua sessão expirou/);

  assert.equal(values.has(SESSION_KEY), false);
  assert.equal(getApiToken(), null);
  assert.deepEqual(assignedPaths, ['/login']);
});
