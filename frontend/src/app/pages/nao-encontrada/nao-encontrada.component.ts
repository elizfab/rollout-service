import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'rs-nao-encontrada',
  imports: [RouterLink, NzResultModule, NzButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-result nzStatus="404" nzTitle="Página não encontrada" nzSubTitle="Essa rota não existe no Rollout.">
      <div nz-result-extra>
        <a nz-button nzType="primary" routerLink="/releases">Ir para releases</a>
      </div>
    </nz-result>
  `,
})
export class NaoEncontradaComponent {}
