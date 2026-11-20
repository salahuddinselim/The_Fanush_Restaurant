"""Run once to seed the database with an admin user and default content."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

init_password = os.environ.get("ADMIN_INIT_PASSWORD")
if not init_password:
    print("ERROR: Set ADMIN_INIT_PASSWORD environment variable before seeding.", file=sys.stderr)
    sys.exit(1)

if not db.query(models.User).filter(models.User.username == "admin").first():
    db.add(models.User(username="admin", hashed_password=hash_password(init_password)))
    print("Created admin user  username=admin")

defaults = {
    "restaurant_name": "The Fanus Restaurant",
    "tagline": "Honest Italian cooking, made fresh every day.",
    "description": "Pasta, pizza, burgers and grill classics served in the heart of Gosnells. Family-friendly and proud to feed the community since 1985.",
    "address": "2310 Albany Hwy, Gosnells WA 6110",
    "phone": "+61 411 074 381",
    "email": "info@fanusrestaurant.com.au",
    "hero_image_url": "",
    "logo_url": "",
    "location_label": "Gosnells · Western Australia",
    "cta_text": "Call to Order",
}
for key, value in defaults.items():
    if not db.query(models.SiteConfig).filter(models.SiteConfig.key == key).first():
        db.add(models.SiteConfig(key=key, value=value))

hours_data = [
    (0, "11:00", "21:00", False),
    (1, "11:00", "21:00", False),
    (2, "11:00", "21:00", False),
    (3, "11:00", "21:00", False),
    (4, "11:00", "22:00", False),
    (5, "10:00", "22:00", False),
    (6, "10:00", "20:00", False),
]
for dow, open_t, close_t, closed in hours_data:
    if not db.query(models.BusinessHour).filter(models.BusinessHour.day_of_week == dow).first():
        db.add(models.BusinessHour(day_of_week=dow, open_time=open_t, close_time=close_t, is_closed=closed))

if not db.query(models.MenuCategory).first():
    pasta = models.MenuCategory(name="Pasta", display_order=1)
    pizza = models.MenuCategory(name="Pizza", display_order=2)
    grill = models.MenuCategory(name="Grill", display_order=3)
    drinks = models.MenuCategory(name="Drinks", display_order=4)
    db.add_all([pasta, pizza, grill, drinks])
    db.flush()
    db.add_all([
        models.MenuItem(category_id=pasta.id, name="Spaghetti Bolognese", description="Classic beef ragù with fresh pasta", price=18.90, display_order=1, image_url="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, name="Penne Arrabbiata", description="Spicy tomato sauce, garlic, chilli", price=16.90, display_order=2, image_url="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pizza.id, name="Margherita", description="San Marzano tomato, fior di latte, basil", price=19.90, display_order=1, image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pizza.id, name="Pepperoni", description="Spicy salami, mozzarella, tomato", price=21.90, display_order=2, image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=grill.id, name="Chicken Parmigiana", description="Crumbed chicken, napoli sauce, melted cheese", price=24.90, display_order=1, image_url="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=drinks.id, name="House Wine (glass)", description="Red or white", price=9.00, display_order=1, image_url="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=drinks.id, name="Sparkling Water", description="500 ml", price=4.50, display_order=2, image_url="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=70&auto=format&fit=crop"),
    ])

db.commit()
db.close()
print("Seed complete.")
