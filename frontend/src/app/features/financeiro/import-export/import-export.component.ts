import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h1>Importação e Exportação de Dados</h1>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="import-section">
            <h2>Importar Dados</h2>
            <p>Faça upload de arquivos Excel (.xlsx, .xls) para importar contas a pagar e receber.</p>

            <div class="upload-area" (click)="fileInput.click()" 
                 (dragover)="onDragOver($event)"
                 (drop)="onDrop($event)">
              <mat-icon>cloud_upload</mat-icon>
              <p>Clique ou arraste arquivos aqui</p>
              <p class="file-types">Formatos aceitos: .xlsx, .xls</p>
            </div>

            <input #fileInput type="file" hidden 
                   accept=".xlsx,.xls" 
                   (change)="onFileSelected($event)">

            <mat-progress-bar *ngIf="uploading" mode="indeterminate"></mat-progress-bar>
          </div>

          <div class="export-section">
            <h2>Exportar Dados</h2>
            <p>Exporte seus dados em formato Excel.</p>

            <div class="export-buttons">
              <button mat-raised-button color="primary" (click)="exportarContasPagar()">
                <mat-icon>download</mat-icon>
                Exportar Contas a Pagar
              </button>

              <button mat-raised-button color="primary" (click)="exportarContasReceber()">
                <mat-icon>download</mat-icon>
                Exportar Contas a Receber
              </button>
            </div>
          </div>

          <div class="template-section">
            <h2>Modelos de Importação</h2>
            <p>Baixe os modelos de arquivo para importação:</p>

            <div class="template-buttons">
              <button mat-stroked-button (click)="baixarModelo('contas-pagar')">
                <mat-icon>description</mat-icon>
                Modelo Contas a Pagar
              </button>

              <button mat-stroked-button (click)="baixarModelo('contas-receber')">
                <mat-icon>description</mat-icon>
                Modelo Contas a Receber
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      margin: 0;
    }

    h2 {
      margin-top: 30px;
      margin-bottom: 15px;
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin: 20px 0;
    }

    .upload-area:hover {
      border-color: #3f51b5;
      background-color: rgba(63, 81, 181, 0.05);
    }

    .upload-area mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3f51b5;
      margin-bottom: 10px;
    }

    .upload-area p {
      margin: 5px 0;
    }

    .file-types {
      font-size: 12px;
      opacity: 0.7;
    }

    .export-buttons, .template-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-top: 20px;
    }

    .export-section, .template-section {
      margin-top: 40px;
    }

    mat-progress-bar {
      margin-top: 10px;
    }
  `]
})
export class ImportExportComponent {
  uploading = false;

  constructor(private snackBar: MatSnackBar) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    // Validar tipo de arquivo
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                       'application/vnd.ms-excel'];

    if (!validTypes.includes(file.type)) {
      this.snackBar.open('Tipo de arquivo inválido. Use arquivos Excel (.xlsx, .xls)', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // TODO: Implementar upload
    this.uploading = true;

    setTimeout(() => {
      this.uploading = false;
      this.snackBar.open('Arquivo importado com sucesso!', 'OK', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 2000);
  }

  exportarContasPagar(): void {
    // TODO: Implementar exportação
    this.snackBar.open('Exportando contas a pagar...', 'OK', {
      duration: 3000
    });
  }

  exportarContasReceber(): void {
    // TODO: Implementar exportação
    this.snackBar.open('Exportando contas a receber...', 'OK', {
      duration: 3000
    });
  }

  baixarModelo(tipo: string): void {
    // TODO: Implementar download do modelo
    this.snackBar.open(`Baixando modelo de ${tipo}...`, 'OK', {
      duration: 3000
    });
  }
}