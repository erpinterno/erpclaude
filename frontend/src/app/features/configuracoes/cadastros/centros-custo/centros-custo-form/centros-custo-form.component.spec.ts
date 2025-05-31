import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrosCustoFormComponent } from './centros-custo-form.component';

describe('CentrosCustoFormComponent', () => {
  let component: CentrosCustoFormComponent;
  let fixture: ComponentFixture<CentrosCustoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentrosCustoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CentrosCustoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
