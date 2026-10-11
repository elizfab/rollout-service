import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('usa o tema salvo e aplica data-theme no <html>', () => {
    localStorage.setItem('rollout.theme', JSON.stringify('dark'));
    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();
    expect(service.mode()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('sem tema salvo, segue o sistema (claro no jsdom)', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.mode()).toBe('light');
  });

  it('alterna e persiste a escolha', () => {
    const service = TestBed.inject(ThemeService);
    service.toggle();
    TestBed.flushEffects();
    expect(service.isDark()).toBe(true);
    expect(JSON.parse(localStorage.getItem('rollout.theme')!)).toBe('dark');
    service.set('light');
    TestBed.flushEffects();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
