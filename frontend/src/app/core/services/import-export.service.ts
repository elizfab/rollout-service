import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Exporta dados (JSON/CSV) e importa JSON escolhido pelo usuário.
 * Uso típico: baixar as releases filtradas, ou carregar um mock alternativo
 * para testar um cenário sem mexer no código.
 */
@Injectable({ providedIn: 'root' })
export class ImportExportService {
  private readonly document = inject(DOCUMENT);

  exportJson(filename: string, data: unknown): void {
    this.download(this.withExtension(filename, 'json'), JSON.stringify(data, null, 2), 'application/json');
  }

  exportCsv<T>(filename: string, rows: readonly T[], columns: readonly CsvColumn<T>[]): void {
    this.download(this.withExtension(filename, 'csv'), this.toCsv(rows, columns), 'text/csv;charset=utf-8');
  }

  /** Gera o CSV (separador `;`, padrão do Excel em pt-BR) com BOM para acentos. */
  toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
    const escape = (v: unknown): string => {
      const text = v === null || v === undefined ? '' : String(v);
      return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const header = columns.map((c) => escape(c.header)).join(';');
    const body = rows.map((row) => columns.map((c) => escape(c.value(row))).join(';'));
    return '﻿' + [header, ...body].join('\r\n');
  }

  /** Lê um arquivo .json e devolve o conteúdo já convertido. */
  async readJsonFile<T = unknown>(file: File): Promise<T> {
    const text = await this.readText(file);
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`O arquivo "${file.name}" não é um JSON válido.`);
    }
  }

  /** FileReader funciona em todos os navegadores suportados (e no jsdom dos testes). */
  private readText(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler o arquivo.'));
      reader.readAsText(file);
    });
  }

  private download(filename: string, content: string, mime: string): void {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = this.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    this.document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  private withExtension(name: string, ext: string): string {
    return name.toLowerCase().endsWith(`.${ext}`) ? name : `${name}.${ext}`;
  }
}
