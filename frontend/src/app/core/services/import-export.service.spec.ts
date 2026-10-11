import { TestBed } from '@angular/core/testing';
import { ImportExportService } from './import-export.service';

describe('ImportExportService', () => {
  let service: ImportExportService;

  beforeEach(() => {
    service = TestBed.inject(ImportExportService);
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = jest.fn(() => 'blob:x');
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = jest.fn();
  });

  it('gera CSV com ; , BOM e escape de aspas', () => {
    const csv = service.toCsv(
      [{ nome: 'a;b', obs: 'diz "oi"' }],
      [
        { header: 'Nome', value: (r) => r.nome },
        { header: 'Obs', value: (r) => r.obs },
      ],
    );
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('Nome;Obs');
    expect(csv).toContain('"a;b";"diz ""oi"""');
  });

  it('dispara o download com a extensão certa', () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    service.exportJson('releases', [{ id: 1 }]);
    service.exportCsv('releases.csv', [{ id: 1 }], [{ header: 'id', value: (r) => r.id }]);
    expect(click).toHaveBeenCalledTimes(2);
    click.mockRestore();
  });

  it('lê JSON válido e recusa inválido', async () => {
    const ok = new File(['[{"id":"r1"}]'], 'ok.json');
    await expect(service.readJsonFile(ok)).resolves.toEqual([{ id: 'r1' }]);
    const bad = new File(['nope'], 'bad.json');
    await expect(service.readJsonFile(bad)).rejects.toThrow('bad.json');
  });
});
