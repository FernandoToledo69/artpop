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

const { formatCpf } = require('../src/services/api/auth.service.ts');

test('formata CPF progressivamente no padrão XXX.XXX.XXX-XX', () => {
  assert.equal(formatCpf('123'), '123');
  assert.equal(formatCpf('1234'), '123.4');
  assert.equal(formatCpf('123456'), '123.456');
  assert.equal(formatCpf('1234567'), '123.456.7');
  assert.equal(formatCpf('123456789'), '123.456.789');
  assert.equal(formatCpf('12345678901'), '123.456.789-01');
});

test('aceita CPF colado com pontuação, remove caracteres não numéricos e limita a 11 dígitos', () => {
  assert.equal(formatCpf('123.456.789-01'), '123.456.789-01');
  assert.equal(formatCpf('abc123.456-78901xyz'), '123.456.789-01');
  assert.equal(formatCpf('123456789012345'), '123.456.789-01');
  assert.equal(formatCpf(''), '');
});
