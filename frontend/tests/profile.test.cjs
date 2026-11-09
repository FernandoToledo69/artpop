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
  formatPhone,
  readArtisanProfile,
  readArtisanProfileForUser,
  updateArtisanProfile,
} = require('../src/services/api/usuarios.service.ts');

const PROFILE_STORAGE_KEY = 'origem:artisan-profile:guest';
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

function setCurrentUser(id, name, email, artisanId) {
  storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    id,
    name,
    email,
    artisanId,
    expiresAt: Date.now() + 60_000,
  }));
}

test('formata telefones móveis e fixos nos padrões aceitos', () => {
  assert.equal(formatPhone('81999991234'), '(81) 99999-1234');
  assert.equal(formatPhone('(81) 99999-1234'), '(81) 99999-1234');
  assert.equal(formatPhone('8133331234'), '(81) 3333-1234');
  assert.equal(formatPhone('(81) 3333-1234'), '(81) 3333-1234');
  assert.equal(formatPhone('81a3333-1234'), '(81) 3333-1234');
  assert.equal(formatPhone('819'), '(81) 9');
  assert.equal(formatPhone(''), '');
});

test('normaliza telefones antigos do perfil para incluir espaço após o DDD', () => {
  setCurrentUser('user-1', 'Usuário', 'user@example.test');
  storage.setItem('origem:artisan-profile:user-1', JSON.stringify({
    phone: '(81)99999-1234',
  }));

  assert.equal(readArtisanProfile().phone, '(81) 99999-1234');
  assert.equal(updateArtisanProfile({ ...readArtisanProfile(), phone: '8133331234' }).phone, '(81) 3333-1234');
});

test('mantém os dados de perfil separados entre usuários', () => {
  setCurrentUser('admin-1', 'Admin', 'admin@example.test');
  updateArtisanProfile({
    ...readArtisanProfile(),
    phone: '(11) 99999-1234',
    address: 'Endereço do admin',
    city: 'Recife',
    state: 'PE',
    bio: 'Perfil do admin',
    avatarImage: 'data:image/jpeg;base64,admin-avatar',
  });

  setCurrentUser('buyer-1', 'Compradora', 'buyer@example.test');
  assert.equal(readArtisanProfile().name, 'Compradora');
  assert.equal(readArtisanProfile().phone, '');
  assert.equal(readArtisanProfile().address, '');
  assert.equal(readArtisanProfile().city, '');
  assert.equal(readArtisanProfile().state, '');
  assert.notEqual(readArtisanProfile().bio, 'Perfil do admin');
  assert.equal(readArtisanProfile().avatarImage, '');

  setCurrentUser('admin-1', 'Admin', 'admin@example.test');
  assert.equal(readArtisanProfile().phone, '(11) 99999-1234');
  assert.equal(readArtisanProfile().address, 'Endereço do admin');
  assert.equal(readArtisanProfile().city, 'Recife');
  assert.equal(readArtisanProfile().state, 'PE');
  assert.equal(readArtisanProfile().bio, 'Perfil do admin');
});

test('associa o perfil de artesão ao identificador individual da conta', () => {
  setCurrentUser('user-1', 'Artesã', 'artesan@example.test', 'artisan-1');
  updateArtisanProfile({
    ...readArtisanProfile(),
    city: 'Olinda',
    avatarImage: 'data:image/jpeg;base64,artisan-avatar',
  });

  assert.equal(storage.getItem('origem:artisan-profile:artisan-1') !== null, true);
  assert.equal(readArtisanProfileForUser('artisan-1').city, 'Olinda');

  setCurrentUser('user-2', 'Outro usuário', 'user2@example.test');
  assert.equal(readArtisanProfile().city, '');
  assert.equal(readArtisanProfileForUser('artisan-1').avatarImage, 'data:image/jpeg;base64,artisan-avatar');
  assert.equal('email' in readArtisanProfileForUser('artisan-1'), false);
  assert.equal('address' in readArtisanProfileForUser('artisan-1'), false);
  assert.equal('addressNumber' in readArtisanProfileForUser('artisan-1'), false);
  assert.equal('addressComplement' in readArtisanProfileForUser('artisan-1'), false);
});

test('migra dados antigos somente para a conta cujo e-mail corresponde ao perfil legado', () => {
  storage.setItem('origem:artisan-profile', JSON.stringify({
    name: 'Ana Lima',
    email: 'ana@example.test',
    phone: '(81) 99999-1234',
    address: 'Endereço antigo',
  }));

  setCurrentUser('admin-1', 'Admin', 'admin@example.test');
  assert.equal(readArtisanProfile().address, '');
  assert.notEqual(storage.getItem('origem:artisan-profile:admin-1'), storage.getItem('origem:artisan-profile'));

  setCurrentUser('artisan-user', 'Ana Lima', 'ana@example.test', 'artisan-1');
  assert.equal(readArtisanProfile().phone, '(81) 99999-1234');
  assert.equal(storage.getItem('origem:artisan-profile'), null);
});

test('salva e recupera os dados pessoais e a nova foto de perfil', () => {
  const profile = {
    ...readArtisanProfile(),
    phone: '(81) 99999-1234',
    address: 'Rua das Flores',
    addressNumber: '123',
    addressComplement: 'Apto 45, bloco B',
    avatarImage: 'data:image/jpeg;base64,mock-profile-photo',
  };

  updateArtisanProfile(profile);

  assert.deepEqual(JSON.parse(storage.getItem(PROFILE_STORAGE_KEY)), profile);
  assert.deepEqual(readArtisanProfile(), profile);
});
