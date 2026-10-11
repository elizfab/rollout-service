import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('cria o app e aplica o tema no <html>', () => {
    TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(fixture.componentInstance).toBeTruthy();
    expect(document.documentElement.getAttribute('data-theme')).toMatch(/light|dark/);
  });
});
