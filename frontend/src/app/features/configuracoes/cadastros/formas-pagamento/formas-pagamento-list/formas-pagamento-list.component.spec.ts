import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasPagamentoListComponent } from './formas-pagamento-list.component';

describe('FormasPagamentoListComponent', () => {
  let component: FormasPagamentoListComponent;
  let fixture: ComponentFixture<FormasPagamentoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasPagamentoListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasPagamentoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
