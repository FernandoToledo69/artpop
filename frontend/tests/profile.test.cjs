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
  readArtisanProfile,
  updateArtisanProfile,
} = require('../src/services/api/usuarios.service.ts');

const PROFILE_STORAGE_KEY = 'origem:artisan-profile';

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

test('salva e recupera os dados pessoais e a nova foto de perfil', () => {
  const profile = {
    ...readArtisanProfile(),
    phone: '(81) 99999-1234',
    avatarImage: 'data:image/jpeg;base64,mock-profile-photo',
  };

  updateArtisanProfile(profile);

  assert.deepEqual(JSON.parse(storage.getItem(PROFILE_STORAGE_KEY)), profile);
  assert.deepEqual(readArtisanProfile(), profile);
});
