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
if len(init_password) < 12 or len(init_password.encode("utf-8")) > 72:
    print("ERROR: ADMIN_INIT_PASSWORD must be 12-72 bytes.", file=sys.stderr)
    sys.exit(1)

admin_user = db.query(models.User).filter(models.User.username == "admin").first()
if not admin_user:
    db.add(models.User(username="admin", hashed_password=hash_password(init_password)))
    print("Created admin user  username=admin")
else:
    admin_user.hashed_password = hash_password(init_password)
    print("Updated admin password  username=admin")

defaults = {
    "restaurant_name": "The Fanus Restaurant",
    "tagline": "Honest Italian cooking, made fresh every day.",
    "description": "Pasta, pizza, burgers and grill classics served in the heart of Gosnells. Family-friendly, women-owned, and proud to feed the neighbourhood.",
    "address": "2310 Albany Hwy, Gosnells WA 6110",
    "phone": "+61 411 074 381",
    "email": "info@fanusrestaurant.com.au",
    "hero_image_url": "",
    "logo_url": "",
    "location_label": "Gosnells · Western Australia",
    "cta_text": "Call to Order",
    "parking_info": "Free on-site parking at rear & wheelchair accessible",
}
for key, value in defaults.items():
    if not db.query(models.SiteConfig).filter(models.SiteConfig.key == key).first():
        db.add(models.SiteConfig(key=key, value=value))

# Monday=0 closed, Tue–Sun open 10:30–21:00 (Fri/Sat until 22:00)
hours_data = [
    (0, None,    None,    True),   # Monday  — closed
    (1, "10:30", "21:00", False),  # Tuesday
    (2, "10:30", "21:00", False),  # Wednesday
    (3, "10:30", "21:00", False),  # Thursday
    (4, "10:30", "22:00", False),  # Friday
    (5, "10:30", "22:00", False),  # Saturday
    (6, "10:30", "20:00", False),  # Sunday
]
for dow, open_t, close_t, closed in hours_data:
    if not db.query(models.BusinessHour).filter(models.BusinessHour.day_of_week == dow).first():
        db.add(models.BusinessHour(day_of_week=dow, open_time=open_t, close_time=close_t, is_closed=closed))

if not db.query(models.MenuCategory).first():
    most_ordered  = models.MenuCategory(name="Most Ordered",  display_order=1)
    drinks        = models.MenuCategory(name="Drinks",         display_order=2)
    rice_dishes   = models.MenuCategory(name="Rice Dishes",    display_order=3)
    sides         = models.MenuCategory(name="Sides",          display_order=4)
    burgers       = models.MenuCategory(name="Burgers",        display_order=5)
    grill         = models.MenuCategory(name="Grill",          display_order=6)
    pasta         = models.MenuCategory(name="Pasta",          display_order=7)

    db.add_all([most_ordered, drinks, rice_dishes, sides, burgers, grill, pasta])
    db.flush()

    db.add_all([
        # ----- Most Ordered -----
        models.MenuItem(category_id=most_ordered.id, display_order=1,
            name="Parma Chicken", price=20.00,
            description="Crumbed chicken breast, napolitana sauce, melted mozzarella, served with chips.",
            image_url="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=2,
            name="Soul Burger with Fries", price=20.00,
            description="Crispy buttermilk fried chicken, cheese, red onion, tomato, garlic aioli, crispy lettuce in a brioche bun with fries.",
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=3,
            name="Garden Salad", price=5.00,
            description="Fresh mixed greens with seasonal vegetables.",
            image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=4,
            name="Pollo Al Funghi", price=23.00,
            description="Pan-fried free-range chicken and mushroom cooked in rich creamy garlic sauce with penne, finished with parmesan and parsley.",
            image_url="https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=5,
            name="Spaghetti Bolognaise", price=20.00,
            description="Homemade fresh bolognese sauce, parmesan cheese, parsley, and spaghetti pasta.",
            image_url="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=6,
            name="Cheesy Garlic Bread", price=10.00,
            description="3 slices of crusty Italian bread with garlic butter and melted cheese.",
            image_url="https://images.unsplash.com/photo-1619531040576-f9416740661a?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=7,
            name="Kids' Pasta", price=10.00,
            description="Pasta served with butter or tomato sauce, tailored for a child's palate.",
            image_url="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=8,
            name="Chips", price=7.00,
            description="Thinly sliced potatoes, fried until crispy and seasoned with sea salt.",
            image_url="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=9,
            name="Chicken and Mushroom Risotto", price=24.00,
            description="Pan-fried free-range chicken and mushroom cooked in rich creamy garlic sauce with arborio rice.",
            image_url="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=10,
            name="Steak Burger with Fries", price=24.00,
            description="Homemade grilled beef, sliced red onion, sliced tomato, garlic aioli, and crispy lettuce in a brioche bun with fries.",
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=11,
            name="Chicken Steak", price=23.00,
            description="Grilled chicken breast served with creamy mash potato, chips, or salad and garlic sauce.",
            image_url="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=most_ordered.id, display_order=12,
            name="Carbonara Pasta", price=22.00,
            description="Pan-fried turkey ham and mushroom cooked in rich creamy garlic sauce with fettuccine, finished with parmesan and parsley.",
            image_url="https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=70&auto=format&fit=crop"),

        # ----- Drinks -----
        models.MenuItem(category_id=drinks.id, display_order=1,
            name="Mango Thick Shake", price=7.00,
            description="Blended with ripe mango and milk — creamy texture with rich mango flavour.",
            image_url="https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=drinks.id, display_order=2,
            name="Banana Thick Shake", price=7.00,
            description="Blended with ripe bananas, rich ice cream, and a touch of milk.",
            image_url="https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=drinks.id, display_order=3,
            name="Chocolate Thick Shake", price=7.00,
            description="Rich chocolate ice cream blended with full cream milk, topped with whipped cream.",
            image_url="https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=drinks.id, display_order=4,
            name="Vanilla Thick Shake", price=7.00,
            description="Creamy vanilla ice cream blended with full cream milk.",
            image_url="https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=drinks.id, display_order=5,
            name="Variety of Coke 375ml", price=4.00,
            description="A 375ml can of Coca-Cola — selection of varieties available.",
            image_url="https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=70&auto=format&fit=crop"),

        # ----- Rice Dishes -----
        models.MenuItem(category_id=rice_dishes.id, display_order=1,
            name="Garlic Prawns with Rice", price=20.00,
            description="Pan-fried garlic prawns cooked in rich creamy garlic sauce with steamed arborio rice.",
            image_url="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=rice_dishes.id, display_order=2,
            name="Chili Prawn with Rice", price=20.00,
            description="Pan-fried prawns, chili, tomato, and parsley cooked in rich napolitana sauce with steamed rice.",
            image_url="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=rice_dishes.id, display_order=3,
            name="Veggie Risotto", price=20.00,
            description="Pan-fried garlic, onion, and olives cooked in rich creamy sauce with arborio rice.",
            image_url="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=rice_dishes.id, display_order=4,
            name="Prawn Risotto", price=25.00,
            description="Pan-fried garlic and onion cooked in rich creamy garlic sauce with arborio rice and fresh parsley.",
            image_url="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=rice_dishes.id, display_order=5,
            name="Chicken and Mushroom Risotto", price=24.00,
            description="Pan-fried free-range chicken and mushroom cooked in rich creamy garlic sauce with arborio rice.",
            image_url="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=70&auto=format&fit=crop"),

        # ----- Sides -----
        models.MenuItem(category_id=sides.id, display_order=1,
            name="Chicken Wings", price=12.00,
            description="10 slow-cooked juicy and crispy sweet and spicy wings.",
            image_url="https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=sides.id, display_order=2,
            name="Arancini", price=13.00,
            description="Homemade rice balls served with napolitana sauce, parmesan, and Italian glaze.",
            image_url="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=sides.id, display_order=3,
            name="Chips", price=7.00,
            description="Thinly sliced potatoes, fried until crispy and seasoned with sea salt.",
            image_url="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=sides.id, display_order=4,
            name="Garden Salad", price=5.00,
            description="Fresh mixed greens with seasonal vegetables.",
            image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=sides.id, display_order=5,
            name="Chicken Nuggets and Chips", price=10.00,
            description="Breaded chicken nuggets with chips, served with tomato sauce.",
            image_url="https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=sides.id, display_order=6,
            name="Kids' Pasta", price=10.00,
            description="Pasta served with butter or tomato sauce, tailored for a child's palate.",
            image_url="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=sides.id, display_order=7,
            name="Arborio Steamed Rice", price=8.00,
            description="Arborio rice steamed to perfection with a subtle blend of herbs.",
            image_url="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=sides.id, display_order=8,
            name="Garlic Bread", price=7.00,
            description="3 slices of crusty Italian bread with garlic butter.",
            image_url="https://images.unsplash.com/photo-1619531040576-f9416740661a?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=sides.id, display_order=9,
            name="Cheesy Garlic Bread", price=10.00,
            description="3 slices of crusty Italian bread with garlic butter and melted cheese.",
            image_url="https://images.unsplash.com/photo-1619531040576-f9416740661a?w=400&q=70&auto=format&fit=crop"),

        # ----- Burgers -----
        models.MenuItem(category_id=burgers.id, display_order=1,
            name="Soul Burger with Fries", price=20.00,
            description="Crispy buttermilk fried chicken, cheese, red onion, tomato, garlic aioli, and crispy lettuce in a brioche bun with fries.",
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=burgers.id, display_order=2,
            name="Steak Burger with Fries", price=24.00,
            description="Homemade grilled beef, sliced red onion, sliced tomato, garlic aioli, and crispy lettuce in a brioche bun with fries.",
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=burgers.id, display_order=3,
            name="Cheese Deluxe Burger with Chips", price=23.00,
            description="Homemade grilled beef patty, cheese, red onion, tomato, garlic aioli, and crispy lettuce in a brioche bun with fries.",
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=burgers.id, display_order=4,
            name="Parma Burger with Fries", price=18.00,
            description="Crispy crumbed chicken, cheese, sliced red onion, tomato, garlic aioli, and crispy lettuce in a brioche bun with fries.",
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70&auto=format&fit=crop"),

        # ----- Grill -----
        models.MenuItem(category_id=grill.id, display_order=1,
            name="Parma Chicken", price=20.00,
            description="Crumbed chicken breast, napolitana sauce, melted mozzarella, served with chips.",
            image_url="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=grill.id, display_order=2,
            name="Chicken Steak", price=23.00,
            description="Grilled chicken breast served with creamy mash potato, chips, or salad and garlic sauce.",
            image_url="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=70&auto=format&fit=crop"),

        # ----- Pasta -----
        models.MenuItem(category_id=pasta.id, display_order=1,
            name="Beef Ragu", price=24.00,
            description="5-hour slow-cooked beef in rich napolitana sauce with fettuccine pasta, finished with parmesan and parsley.",
            image_url="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=2,
            name="Chili Prawn Pasta", price=25.00,
            description="Pan-fried chili prawns cooked in fresh napolitana sauce with spaghetti, finished with parsley.",
            image_url="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=3,
            name="Arrabiata Pasta", price=20.00,
            description="Traditional Italian onion, garlic, chili flakes, parsley, basil, and parmesan with penne pasta.",
            image_url="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=4,
            name="Pesto Penne", price=24.00,
            description="Free-range chicken and spinach cooked in basil pesto and creamy garlic sauce.",
            image_url="https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=5,
            name="Chicken and Veg Pasta", price=22.00,
            description="Pan-fried chicken, onion, capsicum, mushroom, and olives cooked in red and white sauce.",
            image_url="https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=6,
            name="Prawn Fettuccine", price=25.00,
            description="Pan-fried garlic prawns cooked in rich creamy garlic sauce with fettuccine pasta and fresh parsley.",
            image_url="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=7,
            name="Spaghetti Bolognaise", price=20.00,
            description="Homemade fresh bolognese sauce, parmesan cheese, parsley, and spaghetti pasta.",
            image_url="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=8,
            name="Veggie Penne", price=20.00,
            description="Pan-fried garlic and olives cooked in rich creamy sauce with penne pasta and parmesan cheese.",
            image_url="https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=9,
            name="Carbonara Pasta", price=22.00,
            description="Pan-fried turkey ham and mushroom cooked in rich creamy garlic sauce with fettuccine, finished with parmesan and parsley.",
            image_url="https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=70&auto=format&fit=crop"),
        models.MenuItem(category_id=pasta.id, display_order=10,
            name="Pollo Al Funghi", price=23.00,
            description="Pan-fried free-range chicken and mushroom cooked in rich creamy garlic sauce with penne, finished with parmesan and parsley.",
            image_url="https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=70&auto=format&fit=crop"),
    ])

if not db.query(models.GalleryImage).first():
    db.add_all([
        models.GalleryImage(image_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", caption="Cozy Dining Room & Candlelit Tables", display_order=1, is_active=True),
        models.GalleryImage(image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", caption="Handcrafted Pizza in Wood-Fired Oven", display_order=2, is_active=True),
        models.GalleryImage(image_url="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80", caption="Fresh Daily Pasta & Braised Ragù", display_order=3, is_active=True),
        models.GalleryImage(image_url="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80", caption="Selected Italian & Australian Cellar Wines", display_order=4, is_active=True),
        models.GalleryImage(image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", caption="Chargrilled Steaks & Cutlets", display_order=5, is_active=True),
        models.GalleryImage(image_url="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80", caption="Housemade Tiramisu & Fresh Espresso", display_order=6, is_active=True),
    ])

if not db.query(models.Review).first():
    db.add_all([
        models.Review(name="Marco Bellini", rating=5, comment="Authentic handmade pasta just like in Emilia-Romagna. The beef ragù is slow-cooked for 6 hours — unbelievable flavour!"),
        models.Review(name="Sarah Jenkins", rating=5, comment="Our Friday family tradition. Crispy pizza crust, generous pasta bowls, and the staff treats you like family."),
        models.Review(name="David & Michelle Tan", rating=5, comment="Fair prices, generous portions, and the house tiramisu is an absolute masterpiece. Best Italian in Gosnells!"),
    ])

db.commit()
db.close()
print("Seed complete.")
