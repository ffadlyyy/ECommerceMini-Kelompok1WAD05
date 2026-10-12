from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.seed import seed_data
from app.models import Category, Product, Review

def test_seed_data_populates_tables():
    test_engine = create_engine("sqlite:///:memory:")
    Session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = Session()

    seed_data(db)

    assert db.query(Category).count() == 6
    assert db.query(Product).count() == 14
    assert db.query(Review).count() == 6
    db.close()
