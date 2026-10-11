import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  // Instancia o ThemeService logo no início, para aplicar o tema salvo.
  readonly theme = inject(ThemeService);
}
