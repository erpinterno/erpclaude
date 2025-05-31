import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanoContasFormComponent } from './plano-contas-form.component';

describe('PlanoContasFormComponent', () => {
  let component: PlanoContasFormComponent;
  let fixture: ComponentFixture<PlanoContasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanoContasFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanoContasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
