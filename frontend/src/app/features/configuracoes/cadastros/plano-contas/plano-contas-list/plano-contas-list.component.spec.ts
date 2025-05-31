import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanoContasListComponent } from './plano-contas-list.component';

describe('PlanoContasListComponent', () => {
  let component: PlanoContasListComponent;
  let fixture: ComponentFixture<PlanoContasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanoContasListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanoContasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
