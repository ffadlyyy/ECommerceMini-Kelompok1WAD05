from app.core.config import settings

def test_settings_load_defaults():
    assert settings.PROJECT_NAME == "E-Commerce Mini Backend"
    assert "ecommerce_wad" in settings.DATABASE_URL
