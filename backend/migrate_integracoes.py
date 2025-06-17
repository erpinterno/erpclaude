#!/usr/bin/env python3
"""
Script para migrar a tabela de integrações e adicionar colunas faltantes
"""
import sqlite3
import os
import sys

# Adicionar o diretório atual ao path para importar módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def get_table_columns(db_path, table_name):
    """Obter colunas existentes de uma tabela"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [column[1] for column in cursor.fetchall()]
    
    conn.close()
    return columns

def column_exists(db_path, table_name, column_name):
    """Verificar se uma coluna existe na tabela"""
    columns = get_table_columns(db_path, table_name)
    return column_name in columns

def add_column_if_not_exists(db_path, table_name, column_definition):
    """Adicionar coluna se ela não existir"""
    column_name = column_definition.split()[0]
    
    if not column_exists(db_path, table_name, column_name):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_definition}")
            conn.commit()
            print(f"✅ Coluna '{column_name}' adicionada à tabela '{table_name}'")
        except Exception as e:
            print(f"❌ Erro ao adicionar coluna '{column_name}': {e}")
        finally:
            conn.close()
    else:
        print(f"✓ Coluna '{column_name}' já existe na tabela '{table_name}'")

def migrate_integracoes():
    """Migrar tabela de integrações"""
    # Caminhos possíveis para o banco de dados
    possible_db_paths = [
        "erp_database.db",
        "erp_claude.db",
        "../erp_database.db"
    ]
    
    db_path = None
    for path in possible_db_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        print("❌ Banco de dados não encontrado!")
        return False
    
    print(f"🔧 Migrando banco de dados: {db_path}")
    
    # Verificar se a tabela integracoes existe
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='integracoes'")
    if not cursor.fetchone():
        print("❌ Tabela 'integracoes' não encontrada!")
        conn.close()
        return False
    
    conn.close()
    
    # Colunas que devem existir na tabela integracoes
    required_columns = [
        "estrutura_dados TEXT",
        "formato_exemplo TEXT", 
        "tipo_requisicao VARCHAR(10) DEFAULT 'GET'",
        "intervalo_execucao INTEGER",
        "cron_expression VARCHAR(100)",
        "tabela_destino VARCHAR(100)",
        "tela_origem VARCHAR(100)",
        "consulta_sql TEXT",
        "tipo_importacao VARCHAR(20) DEFAULT 'INCREMENTAL'",
        "base_url VARCHAR(255)",
        "metodo_integracao VARCHAR(100)",
        "app_key VARCHAR(255)",
        "app_secret VARCHAR(255)",
        "link_integracao VARCHAR(500)",
        "link_documentacao VARCHAR(500)",
        "token VARCHAR(500)",
        "configuracoes_extras TEXT",
        "testado BOOLEAN DEFAULT 0",
        "ultima_sincronizacao DATETIME"
    ]
    
    print(f"\n🔍 Verificando colunas da tabela 'integracoes':")
    existing_columns = get_table_columns(db_path, "integracoes")
    print(f"Colunas existentes: {', '.join(existing_columns)}")
    
    print(f"\n🔧 Adicionando colunas faltantes:")
    for column_def in required_columns:
        add_column_if_not_exists(db_path, "integracoes", column_def)
    
    # Verificar tabelas de logs e documentação
    print(f"\n🔍 Verificando tabelas relacionadas:")
    
    # Criar tabela de logs se não existir
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='integracoes_logs'")
    if not cursor.fetchone():
        print("📋 Criando tabela 'integracoes_logs'...")
        cursor.execute("""
            CREATE TABLE integracoes_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                integracao_id INTEGER NOT NULL,
                data_execucao DATETIME DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) NOT NULL,
                mensagem TEXT,
                detalhes TEXT,
                tempo_execucao INTEGER,
                registros_processados INTEGER DEFAULT 0,
                registros_importados INTEGER DEFAULT 0,
                registros_atualizados INTEGER DEFAULT 0,
                registros_erro INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Tabela 'integracoes_logs' criada")
    else:
        print("✓ Tabela 'integracoes_logs' já existe")
    
    # Criar tabela de documentação se não existir
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='integracoes_documentacao'")
    if not cursor.fetchone():
        print("📋 Criando tabela 'integracoes_documentacao'...")
        cursor.execute("""
            CREATE TABLE integracoes_documentacao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                integracao_id INTEGER NOT NULL,
                nome_arquivo VARCHAR(255) NOT NULL,
                conteudo TEXT,
                tipo_arquivo VARCHAR(10),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("✅ Tabela 'integracoes_documentacao' criada")
    else:
        print("✓ Tabela 'integracoes_documentacao' já existe")
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Migração da tabela 'integracoes' concluída com sucesso!")
    return True

if __name__ == "__main__":
    print("🚀 Iniciando migração das integrações...\n")
    success = migrate_integracoes()
    
    if success:
        print("\n🎉 Migração concluída com sucesso!")
        print("Agora você pode reiniciar o servidor backend.")
    else:
        print("\n❌ Falha na migração!")
        sys.exit(1)