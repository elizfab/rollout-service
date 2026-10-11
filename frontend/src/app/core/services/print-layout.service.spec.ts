import { TestBed } from '@angular/core/testing';
import { PrintLayoutService } from './print-layout.service';

describe('PrintLayoutService', () => {
  it('marca o body, troca o título e restaura depois de imprimir', () => {
    const service = TestBed.inject(PrintLayoutService);
    document.title = 'Original';
    const print = jest.spyOn(window, 'print').mockImplementation(() => undefined);

    service.print('Relatório');
    expect(print).toHaveBeenCalled();
    expect(document.body.classList.contains(PrintLayoutService.BODY_CLASS)).toBe(true);
    expect(document.title).toBe('Relatório');

    window.dispatchEvent(new Event('afterprint'));
    expect(document.body.classList.contains(PrintLayoutService.BODY_CLASS)).toBe(false);
    expect(document.title).toBe('Original');
    print.mockRestore();
  });
});
