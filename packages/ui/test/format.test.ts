import { describe, expect, it } from 'vitest';

import { formatMoney, formatPercent, initials, maskDocument, onlyDigits } from '../src';

// Intl usa espaço não separável entre "R$" e o número.
const brl = (text: string) => text.replace(' ', ' ');

describe('format', () => {
  it('formats cents as Brazilian reais', () => {
    expect(formatMoney(125000)).toBe(brl('R$ 1.250,00'));
    expect(formatMoney(1990)).toBe(brl('R$ 19,90'));
    expect(formatMoney(0)).toBe(brl('R$ 0,00'));
  });

  it('formats fee rates with two decimals', () => {
    expect(formatPercent(0.0349)).toBe('3,49%');
    expect(formatPercent(0.0099)).toBe('0,99%');
  });

  it('masks CPF and CNPJ while the person types', () => {
    expect(maskDocument('123')).toBe('123');
    expect(maskDocument('1234567')).toBe('123.456.7');
    expect(maskDocument('12345678901')).toBe('123.456.789-01');
    expect(maskDocument('112223330001')).toBe('11.222.333/0001');
    expect(maskDocument('11222333000181')).toBe('11.222.333/0001-81');
    expect(maskDocument('11.222.333/0001-81999')).toBe('11.222.333/0001-81');
  });

  it('keeps only digits', () => {
    expect(onlyDigits('11.222.333/0001-81')).toBe('11222333000181');
  });

  it('builds avatar initials', () => {
    expect(initials('Loja Exemplo')).toBe('LE');
    expect(initials('Padaria')).toBe('PA');
    expect(initials('  Loja   do   Bairro ')).toBe('LB');
  });
});
