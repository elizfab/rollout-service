import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideComponentTesting } from '../../testing/test-providers';
import { DataSourceBadgeComponent } from './data-source-badge/data-source-badge.component';
import { LogoComponent } from './logo/logo.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { ReleaseActionModalComponent } from './release-action-modal/release-action-modal.component';
import { StatusTagComponent } from './status-tag/status-tag.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { ReleaseAction, ReleaseActionRequest } from '../../models/release-action.model';

describe('componentes compartilhados', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideComponentTesting() }));

  it('StatusTag mostra o rótulo e usa os tokens do tema', () => {
    const f = TestBed.createComponent(StatusTagComponent);
    f.componentRef.setInput('status', 'in_progress');
    f.detectChanges();
    const el: HTMLElement = f.nativeElement.querySelector('.rs-status');
    expect(el.textContent).toContain('Em progresso');
    expect(el.getAttribute('style')).toContain('--rs-status-in-progress-bg');
  });

  it('Logo mostra o nome e some com ele no modo compacto', () => {
    const f = TestBed.createComponent(LogoComponent);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('rollout');
    f.componentRef.setInput('compact', true);
    f.detectChanges();
    expect(f.nativeElement.textContent).not.toContain('rollout');
  });

  it('ThemeToggle alterna o tema', () => {
    const f = TestBed.createComponent(ThemeToggleComponent);
    f.detectChanges();
    const before = f.componentInstance.theme.mode();
    f.nativeElement.querySelector('button').click();
    expect(f.componentInstance.theme.mode()).not.toBe(before);
  });

  it('PageHeader lista os endpoints', () => {
    const f = TestBed.createComponent(PageHeaderComponent);
    f.componentRef.setInput('title', 'Releases');
    f.componentRef.setInput('endpoints', ['GET /v1/releases']);
    f.detectChanges();
    expect(f.nativeElement.querySelector('h1').textContent).toBe('Releases');
    expect(f.nativeElement.querySelector('code').textContent).toBe('GET /v1/releases');
  });

  it('DataSourceBadge indica mock local', () => {
    const f = TestBed.createComponent(DataSourceBadgeComponent);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Mock local');
    expect(f.componentInstance.tooltip()).toContain('localStorage');
  });
});

@Component({
  imports: [ReleaseActionModalComponent],
  template: `<rs-release-action-modal [action]="action()" [count]="2" (confirmed)="last = $event" />`,
})
class HostComponent {
  readonly action = signal<ReleaseAction | null>(null);
  last: ReleaseActionRequest | null = null;
}

describe('ReleaseActionModal', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: provideComponentTesting() }));

  it('exige motivo (e data para reagendar) antes de confirmar', () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.action.set('reschedule');
    f.detectChanges();
    const modal = f.debugElement.children[0].componentInstance as ReleaseActionModalComponent;

    expect(modal.title()).toBe('Reagendar 2 releases');
    modal.submit();
    expect(f.componentInstance.last).toBeNull();

    modal.reason.set('conflito de janela');
    expect(modal.valid()).toBe(false);
    modal.scheduledAt.set(new Date('2026-10-20T09:00:00.000Z'));
    expect(modal.valid()).toBe(true);
    modal.submit();
    expect(f.componentInstance.last).toEqual({
      action: 'reschedule',
      reason: 'conflito de janela',
      scheduledAt: '2026-10-20T09:00:00.000Z',
    });
  });

  it('ações destrutivas ficam marcadas', () => {
    const f = TestBed.createComponent(HostComponent);
    f.componentInstance.action.set('rollback');
    f.detectChanges();
    const modal = f.debugElement.children[0].componentInstance as ReleaseActionModalComponent;
    expect(modal.meta()?.destructive).toBe(true);
    expect(modal.title()).toBe('Rollback 2 releases');
  });
});
