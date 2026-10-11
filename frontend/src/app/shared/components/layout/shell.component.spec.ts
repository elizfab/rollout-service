import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { provideComponentTesting } from '../../../testing/test-providers';
import { ShellComponent } from './shell.component';

@Component({ template: 'página' })
class DummyPage {}

describe('ShellComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        ...provideComponentTesting(),
        provideRouter([
          {
            path: '',
            component: ShellComponent,
            children: [{ path: 'releases', component: DummyPage, data: { title: 'Releases', section: 'rollouts' } }],
          },
        ]),
      ],
    });
  });

  it('mostra o menu e o título da rota ativa', async () => {
    const f = TestBed.createComponent(ShellComponent);
    await TestBed.inject(Router).navigateByUrl('/releases');
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('.rs-nav-link').length).toBeGreaterThan(8);
    expect(f.componentInstance.meta().title).toBe('Releases');
  });

  it('recolhe o menu e lembra a escolha', () => {
    const f = TestBed.createComponent(ShellComponent);
    f.componentInstance.toggleSidebar();
    expect(f.componentInstance.collapsed()).toBe(true);
    expect(JSON.parse(localStorage.getItem('rollout.sidebar.collapsed')!)).toBe(true);
  });
});
