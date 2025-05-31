import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

interface ContaPagar {
  id: number;
  descricao: string;
  fornecedor: string;
  valor: number;
  data_vencimento: Date;
  data_pagamento?: Date;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  observacoes?: string;
}

@Component({
  selector: 'app-contas-pagar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './contas-pagar.component.html',
  styleUrls: ['./contas-pagar.component.scss']
})
export class ContasPagarComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['descricao', 'fornecedor', 'valor', 'vencimento', 'status', 'acoes'];
  dataSource = new MatTableDataSource<ContaPagar>([]);
  contaForm: FormGroup;
  
  statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'pago', label: 'Pago' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'vencido', label: 'Vencido' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.contaForm = this.fb.group({
      id: [null],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      fornecedor: ['', [Validators.required]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      data_vencimento: [null, [Validators.required]],
      data_pagamento: [null],
      status: ['pendente', [Validators.required]],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    this.loadContas();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadContas(): void {
    // Dados de exemplo - substituir pela chamada ao serviço
    const contasExemplo: ContaPagar[] = [
      {
        id: 1,
        descricao: 'Pagamento de energia elétrica',
        fornecedor: 'Companhia Elétrica',
        valor: 350.50,
        data_vencimento: new Date('2025-06-15'),
        status: 'pendente',
        observacoes: 'Conta referente ao mês de maio'
      },
      {
        id: 2,
        descricao: 'Aluguel do escritório',
        fornecedor: 'Imobiliária XYZ',
        valor: 2500.00,
        data_vencimento: new Date('2025-06-10'),
        status: 'pago',
        data_pagamento: new Date('2025-06-08')
      },
      {
        id: 3,
        descricao: 'Fornecimento de material de escritório',
        fornecedor: 'Papelaria ABC',
        valor: 150.75,
        data_vencimento: new Date('2025-05-25'),
        status: 'vencido',
        observacoes: 'Materiais diversos para escritório'
      },
      {
        id: 4,
        descricao: 'Serviços de internet',
        fornecedor: 'Provedor Internet',
        valor: 89.90,
        data_vencimento: new Date('2025-06-20'),
        status: 'pendente'
      },
      {
        id: 5,
        descricao: 'Manutenção de equipamentos',
        fornecedor: 'TechService',
        valor: 450.00,
        data_vencimento: new Date('2025-06-25'),
        status: 'pendente',
        observacoes: 'Manutenção preventiva dos computadores'
      }
    ];
    
    this.dataSource.data = contasExemplo;
  }

  // Métodos para os cards de resumo
  getTotalPendente(): number {
    return this.dataSource.data
      .filter(conta => conta.status === 'pendente')
      .reduce((total, conta) => total + conta.valor, 0);
  }

  getTotalVencido(): number {
    return this.dataSource.data
      .filter(conta => conta.status === 'vencido')
      .reduce((total, conta) => total + conta.valor, 0);
  }

  getTotalPago(): number {
    return this.dataSource.data
      .filter(conta => conta.status === 'pago')
      .reduce((total, conta) => total + conta.valor, 0);
  }

  getTotalGeral(): number {
    return this.dataSource.data
      .reduce((total, conta) => total + conta.valor, 0);
  }

  // Métodos de filtro
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByStatus(status: string): void {
    if (status) {
      this.dataSource.filterPredicate = (data: ContaPagar) => data.status === status;
      this.dataSource.filter = 'trigger';
    } else {
      this.dataSource.filterPredicate = () => true;
      this.dataSource.filter = '';
    }
  }

  clearFilters(): void {
    this.dataSource.filter = '';
    this.dataSource.filterPredicate = () => true;
    // Reset form fields if needed
  }

  exportData(): void {
    this.snackBar.open('Funcionalidade de exportação em desenvolvimento', 'OK', {
      duration: 3000
    });
  }

  // Métodos de status
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      pago: 'Pago',
      vencido: 'Vencido',
      cancelado: 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pendente: 'fas fa-clock',
      pago: 'fas fa-check-circle',
      vencido: 'fas fa-exclamation-triangle',
      cancelado: 'fas fa-times-circle'
    };
    return icons[status] || 'fas fa-question-circle';
  }

  isOverdue(dataVencimento: Date): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(dataVencimento);
    vencimento.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  }

  // Métodos de ação
  openDialog(conta?: ContaPagar): void {
    // TODO: Implementar dialog de criação/edição
    if (conta) {
      this.contaForm.patchValue(conta);
    } else {
      this.resetForm();
    }
    
    this.snackBar.open('Funcionalidade em desenvolvimento', 'OK', {
      duration: 3000
    });
  }

  editarConta(conta: ContaPagar): void {
    this.openDialog(conta);
  }

  marcarComoPago(conta: ContaPagar): void {
    // TODO: Implementar via API
    const index = this.dataSource.data.findIndex(c => c.id === conta.id);
    if (index !== -1) {
      this.dataSource.data[index].status = 'pago';
      this.dataSource.data[index].data_pagamento = new Date();
      // Força a atualização da tabela
      this.dataSource.data = [...this.dataSource.data];
    }
    
    this.snackBar.open('Conta marcada como paga com sucesso!', 'OK', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  excluirConta(conta: ContaPagar): void {
    // TODO: Implementar confirmação e exclusão via API
    if (confirm(`Tem certeza que deseja excluir a conta "${conta.descricao}"?`)) {
      const index = this.dataSource.data.findIndex(c => c.id === conta.id);
      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
        // Força a atualização da tabela
        this.dataSource.data = [...this.dataSource.data];
      }
      
      this.snackBar.open('Conta excluída com sucesso!', 'OK', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  onSubmit(): void {
    if (this.contaForm.valid) {
      const formData = this.contaForm.value;
      console.log('Dados do formulário:', formData);
      
      // Aqui você adicionaria a lógica para salvar no backend
      // this.contasService.create(formData).subscribe(...)
      
      this.resetForm();
    } else {
      console.log('Formulário inválido');
      this.markFormGroupTouched();
    }
  }

  resetForm(): void {
    this.contaForm.reset();
    this.contaForm.patchValue({ status: 'pendente' });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contaForm.controls).forEach(key => {
      this.contaForm.get(key)?.markAsTouched();
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
