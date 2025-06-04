#!/usr/bin/env python3
"""
Database migration script for ERP Claude
This script creates the new tables for the contas a pagar system
"""

import os
import sys
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import all models to ensure they are registered
from app.models import *
from app.db.session import Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """Create new tables for the contas a pagar system"""
    
    # Get database URL from environment or use SQLite default
    database_url = os.getenv("DATABASE_URL", "sqlite:///./erp_database.db")
    logger.info(f"🔗 Connecting to database: {database_url}")
    
    try:
        # Create engine
        engine = create_engine(database_url, echo=True)
        
        # Create all tables (this will only create new ones)
        logger.info("🗃️ Creating new database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully!")
        
        # Create session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Create some default categories
            logger.info("📂 Creating default categories...")
            
            # Check if categories already exist
            result = db.execute(text("SELECT COUNT(*) FROM categorias"))
            count = result.scalar()
            
            if count == 0:
                default_categories = [
                    ("Fornecedores", "Pagamentos para fornecedores"),
                    ("Serviços", "Pagamentos de serviços"),
                    ("Impostos", "Pagamentos de impostos e taxas"),
                    ("Salários", "Pagamentos de salários e benefícios"),
                    ("Aluguel", "Pagamentos de aluguel e condomínio"),
                    ("Utilities", "Pagamentos de água, luz, telefone"),
                    ("Marketing", "Gastos com marketing e publicidade"),
                    ("Equipamentos", "Compra e manutenção de equipamentos"),
                    ("Viagens", "Gastos com viagens e hospedagem"),
                    ("Outros", "Outras despesas diversas")
                ]
                
                for nome, descricao in default_categories:
                    db.execute(text(
                        "INSERT INTO categorias (nome, descricao, ativa, created_at) "
                        "VALUES (:nome, :descricao, :ativa, datetime('now'))"
                    ), {"nome": nome, "descricao": descricao, "ativa": True})
                    logger.info(f"  ➕ Created category: {nome}")
                
                db.commit()
                logger.info("✅ Default categories created successfully!")
            else:
                logger.info("📂 Categories already exist in database")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creating default data: {e}")
            db.rollback()
            return False
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Error migrating database: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 Starting database migration...")
    
    if migrate_database():
        logger.info("🎉 Database migration completed successfully!")
        sys.exit(0)
    else:
        logger.error("💥 Database migration failed!")
        sys.exit(1)
