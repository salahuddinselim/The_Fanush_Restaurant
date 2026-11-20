"""Auto-seeder for default content to ensure API always provides rich data."""
from sqlalchemy.orm import Session
from . import models

def ensure_seed_data(db: Session):
    # 1. Site Config
    defaults = {
        "restaurant_name": "The Fanus Restaurant",
        "tagline": "Artisanal Italian Flavours & Warm Hospitality",
        "description": "Handmade pasta rolled daily, wood-fired artisan pizza, and prime chargrilled cuts in the heart of Gosnells.",
        "address": "2310 Albany Hwy, Gosnells WA 6110",
        "phone": "+61 411 074 381",
        "email": "info@fanusrestaurant.com.au",
        "hero_image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1920&q=85",
        "logo_url": "",
        "location_label": "Gosnells · Western Australia",
        "cta_text": "Call to Order",
    }
    for key, val in defaults.items():
        existing = db.query(models.SiteConfig).filter(models.SiteConfig.key == key).first()
        if not existing:
            db.add(models.SiteConfig(key=key, value=val))

    # 2. Business Hours
    hours_data = [
        (0, "11:00", "21:00", False),
        (1, "11:00", "21:00", False),
        (2, "11:00", "21:00", False),
        (3, "11:00", "21:00", False),
        (4, "11:00", "22:00", False),
        (5, "10:00", "22:00", False),
        (6, "10:00", "20:00", False),
    ]
    for dow, open_t, close_t, is_cl in hours_data:
        existing = db.query(models.BusinessHour).filter(models.BusinessHour.day_of_week == dow).first()
        if not existing:
            db.add(models.BusinessHour(day_of_week=dow, open_time=open_t, close_time=close_t, is_closed=is_cl))

    # 3. Categories and Menu Items
    cat_items = [
        ("Pasta", 1, [
            ("Spaghetti Bolognese", "Slow-cooked WA beef & pork ragù, San Marzano tomato, 24-month Parmigiano-Reggiano", 18.90, "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80&auto=format&fit=crop"),
            ("Penne Arrabbiata", "Spicy San Marzano tomato sauce, garlic, fresh red chilli, torn sweet basil", 16.90, "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80&auto=format&fit=crop"),
            ("Fettuccine Carbonara", "Crispy smoked guanciale, free-range egg yolks, pecorino romano, cracked black pepper", 21.50, "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80&auto=format&fit=crop"),
            ("Seafood Linguine", "Local WA tiger prawns, calamari, black mussels, white wine, garlic, cherry tomatoes", 26.90, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80&auto=format&fit=crop"),
            ("Wild Mushroom Ravioli", "Handmade pasta pillows, sautéed forest mushrooms, sage burnt butter, truffle essence", 22.00, "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&q=80&auto=format&fit=crop"),
        ]),
        ("Pizza", 2, [
            ("Margherita Classica", "San Marzano tomatoes, fior di latte mozzarella, fresh basil, extra virgin olive oil", 19.90, "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80&auto=format&fit=crop"),
            ("Pepperoni Diavola", "Spicy Calabrese salami, smoked mozzarella, chilli flakes, wild oregano", 21.90, "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80&auto=format&fit=crop"),
            ("Prosciutto & Funghi", "Prosciutto di Parma, roasted portobello mushrooms, fior di latte, fresh baby rocket", 23.90, "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600&q=80&auto=format&fit=crop"),
            ("Quattro Formaggi", "Fior di latte mozzarella, gorgonzola dolce, creamy fontina, aged parmigiano", 22.50, "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&q=80&auto=format&fit=crop"),
            ("BBQ Meat Lovers", "Smoked bacon, artisan Italian fennel sausage, spicy pepperoni, house BBQ glaze", 24.50, "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&q=80&auto=format&fit=crop"),
        ]),
        ("Grill & Mains", 3, [
            ("Chicken Parmigiana", "Golden herb-crumbed chicken breast, rich napoli sauce, melted mozzarella, steak chips & fresh salad", 24.90, "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80&auto=format&fit=crop"),
            ("Margaret River Ribeye 300g", "Grass-fed WA ribeye steak, garlic rosemary butter, beer-battered chips, seasonal greens", 36.00, "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&auto=format&fit=crop"),
            ("Chargrilled Lamb Cutlets", "Three herb-marinated WA lamb cutlets, roasted truss tomatoes, salsa verde, rosemary potatoes", 32.50, "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&auto=format&fit=crop"),
            ("Crispy Skin Atlantic Salmon", "Pan-seared Tasmanian salmon fillet, saffron risotto, baby asparagus, lemon caper emulsion", 29.50, "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80&auto=format&fit=crop"),
        ]),
        ("Desserts", 4, [
            ("Housemade Classic Tiramisu", "Espresso & Marsala-soaked savoiardi biscuits, whipped mascarpone cream, dark cocoa dust", 13.50, "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80&auto=format&fit=crop"),
            ("Warm Molten Lava Cake", "Rich Belgian dark chocolate molten center, vanilla bean gelato, fresh raspberry coulis", 14.00, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop"),
            ("Sicilian Cannoli Duo", "Crisp fried pastry tubes filled with sweetened sheep ricotta, crushed pistachio, candied orange", 11.50, "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80&auto=format&fit=crop"),
            ("Panna Cotta al Limoncello", "Silky vanilla panna cotta, Amalfi limoncello glaze, fresh summer berries", 12.50, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&auto=format&fit=crop"),
        ]),
        ("Drinks & Wine", 5, [
            ("Margaret River Cabernet Merlot", "Rich blackcurrant notes, subtle French oak, elegant finish (glass)", 9.00, "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80&auto=format&fit=crop"),
            ("WA Sauvignon Blanc", "Crisp citrus, passionfruit aromatics, refreshing natural acidity (glass)", 9.00, "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=600&q=80&auto=format&fit=crop"),
            ("Italian Birra Moretti", "Chilled premium Italian golden lager with a delicate malt aroma (bottle)", 9.50, "https://images.unsplash.com/photo-1608270199042-451877119f4a?w=600&q=80&auto=format&fit=crop"),
            ("Classic Aperol Spritz", "Aperol, Prosecco Superiore, soda water, fresh orange wheel", 14.00, "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&q=80&auto=format&fit=crop"),
            ("San Pellegrino Sparkling 750ml", "Natural sparkling Italian mineral water, chilled", 7.00, "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&auto=format&fit=crop"),
            ("Artisan Espresso / Flat White", "Freshly roasted Italian blend, velvety steamed milk", 4.50, "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80&auto=format&fit=crop"),
        ]),
    ]

    for cat_name, order, items in cat_items:
        cat = db.query(models.MenuCategory).filter(models.MenuCategory.name == cat_name).first()
        if not cat:
            cat = models.MenuCategory(name=cat_name, display_order=order, is_active=True)
            db.add(cat)
            db.flush()

        for item_idx, (name, desc, price, img) in enumerate(items, 1):
            existing_item = db.query(models.MenuItem).filter(
                models.MenuItem.category_id == cat.id,
                models.MenuItem.name == name
            ).first()
            if not existing_item:
                db.add(models.MenuItem(
                    category_id=cat.id,
                    name=name,
                    description=desc,
                    price=price,
                    image_url=img,
                    is_available=True,
                    display_order=item_idx
                ))

    # 4. Gallery Images
    gallery_data = [
        ("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", "Cozy Dining Room & Candlelit Tables", 1),
        ("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", "Handcrafted Pizza in Wood-Fired Oven", 2),
        ("https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80", "Fresh Daily Pasta & Braised Ragù", 3),
        ("https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80", "Selected Italian & Australian Cellar Wines", 4),
        ("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", "Chargrilled Steaks & Cutlets", 5),
        ("https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80", "Housemade Tiramisu & Fresh Espresso", 6),
    ]
    if db.query(models.GalleryImage).count() == 0:
        for url, caption, order in gallery_data:
            db.add(models.GalleryImage(image_url=url, caption=caption, display_order=order, is_active=True))

    # 5. Reviews
    reviews_data = [
        ("Marco Bellini", 5, "Authentic handmade pasta just like in Emilia-Romagna. The beef ragù is slow-cooked for 6 hours — unbelievable flavour!"),
        ("Sarah Jenkins", 5, "Our Friday family tradition. Crispy pizza crust, generous pasta bowls, and the staff treats you like family."),
        ("David & Michelle Tan", 5, "Fair prices, generous portions, and the house tiramisu is an absolute masterpiece. Best Italian in Gosnells!"),
        ("Elena Rossi", 5, "The seafood linguine and the ribeye were cooked to sheer perfection. Warm ambiance and attentive team."),
    ]
    if db.query(models.Review).count() == 0:
        for name, rating, comment in reviews_data:
            db.add(models.Review(name=name, rating=rating, comment=comment))

    db.commit()
