import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrosCustoListComponent } from './centros-custo-list.component';

describe('CentrosCustoListComponent', () => {
  let component: CentrosCustoListComponent;
  let fixture: ComponentFixture<CentrosCustoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentrosCustoListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CentrosCustoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
