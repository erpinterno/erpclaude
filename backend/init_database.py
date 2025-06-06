#!/usr/bin/env python3
"""
Database initialization script for ERP Claude
This script creates all database tables and initial data
"""

import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the app directory to Python path
sys.path.append('/workspaces/erpclaude/backend')

# Import models and utils from the correct locations
from app.models.user import User
from app.models.empresa import Empresa
from app.models.integracao import Integracao
from app.core.security import get_password_hash
from app.db.session import Base, SessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize database with tables and default data"""
    
    # Get database URL from environment - usar SQLite por padrão
    database_url = os.getenv("DATABASE_URL", "sqlite:///./erp_database.db")
    logger.info(f"🔗 Connecting to database: {database_url}")
    
    try:
        # Create engine
        engine = create_engine(database_url, echo=False)
        
        # Create all tables
        logger.info("🗃️ Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully!")
        
        # Use the existing SessionLocal
        db = SessionLocal()
        
        try:
            # Check if users already exist
            if db.query(User).count() > 0:
                logger.info("👤 Users already exist in database")
                return True
                
            logger.info("👤 Creating default users...")
            
            # Create default users
            users_to_create = [
                ("admin@example.com", "Administrador do Sistema", "admin123", True),
                ("financeiro@example.com", "Elon Alb", "fin123", False),
                ("user@example.com", "Maria Silva", "user123", False),
            ]
            
            for email, name, password, is_superuser in users_to_create:
                user = User(
                    email=email,
                    full_name=name,
                    hashed_password=get_password_hash(password),
                    is_active=True,
                    is_superuser=is_superuser
                )
                db.add(user)
                logger.info(f"  ➕ Created user: {email}")
            
            db.commit()
            logger.info("✅ Default users created successfully!")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creating default data: {e}")
            db.rollback()
            return False
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Error initializing database: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 Starting database initialization...")
    
    if init_database():
        logger.info("🎉 Database initialization completed successfully!")
        sys.exit(0)
    else:
        logger.error("💥 Database initialization failed!")
        sys.exit(1)
