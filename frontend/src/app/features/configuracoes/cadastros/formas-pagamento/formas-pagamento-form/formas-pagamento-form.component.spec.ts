import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormasPagamentoFormComponent } from './formas-pagamento-form.component';

describe('FormasPagamentoFormComponent', () => {
  let component: FormasPagamentoFormComponent;
  let fixture: ComponentFixture<FormasPagamentoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormasPagamentoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormasPagamentoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
