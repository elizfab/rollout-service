import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { simulateLatency } from './simulate-latency';

describe('simulateLatency', () => {
  it('é síncrono com 0 e atrasa com valor positivo', fakeAsync(() => {
    let a = 0;
    of(1).pipe(simulateLatency(0)).subscribe((v) => (a = v));
    expect(a).toBe(1);

    let b = 0;
    of(2).pipe(simulateLatency(100)).subscribe((v) => (b = v));
    expect(b).toBe(0);
    tick(100);
    expect(b).toBe(2);
  }));
});
