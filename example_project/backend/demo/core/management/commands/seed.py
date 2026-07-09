"""Seed the database with realistic demo data.

Idempotent: every run wipes the existing Product/Order/etc. rows and
recreates them, so you always end up with the same clean data set.

    python manage.py seed
"""
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from core.models import Category, Order, OrderItem, Product, Supplier

CATEGORIES = ['Electronics', 'Books', 'Home & Kitchen', 'Toys', 'Sports']

SUPPLIERS = [
    ('Acme Corp', 'sales@acme.example'),
    ('Globex Trading', 'orders@globex.example'),
    ('Initech Supplies', 'contact@initech.example'),
    ('Umbrella Goods', 'hello@umbrella.example'),
]

# name, category, supplier index, price
PRODUCTS = [
    ('Wireless Headphones', 'Electronics', 0, '89.99'),
    ('Mechanical Keyboard', 'Electronics', 0, '129.50'),
    ('USB-C Charger 65W', 'Electronics', 1, '34.95'),
    ('4K Webcam', 'Electronics', 1, '74.00'),
    ('The Pragmatic Programmer', 'Books', 2, '42.00'),
    ('Clean Code', 'Books', 2, '38.50'),
    ('Cast Iron Skillet', 'Home & Kitchen', 3, '45.00'),
    ('Ceramic Knife Set', 'Home & Kitchen', 3, '59.99'),
    ('Stainless Water Bottle', 'Home & Kitchen', 1, '24.99'),
    ('Wooden Building Blocks', 'Toys', 3, '29.95'),
    ('Remote Control Car', 'Toys', 0, '54.00'),
    ('Yoga Mat', 'Sports', 2, '27.50'),
    ('Adjustable Dumbbells', 'Sports', 0, '199.00'),
    ('Running Shoes', 'Sports', 1, '89.00'),
]

CUSTOMERS = [
    'Alice Johnson', 'Bob Smith', 'Carla Diaz', 'David Lee',
    'Emma Wilson', 'Frank Nguyen', 'Grace Kim', 'Hector Ramos',
]


class Command(BaseCommand):
    help = 'Clear all data and re-seed the database with demo data.'

    @transaction.atomic
    def handle(self, *args, **options):
        # Deterministic output run-to-run.
        random.seed(42)

        self._clear()

        categories = self._create_categories()
        suppliers = self._create_suppliers()
        products = self._create_products(categories, suppliers)
        self._create_orders(products)

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(categories)} categories, {len(suppliers)} suppliers, '
            f'{len(products)} products, {Order.objects.count()} orders '
            f'({OrderItem.objects.count()} line items).'
        ))

    def _clear(self):
        # Delete in FK-dependency order to respect PROTECT constraints.
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Product.objects.all().delete()
        Supplier.objects.all().delete()
        Category.objects.all().delete()

    def _create_categories(self):
        return {
            name: Category.objects.create(name=name, slug=slugify(name))
            for name in CATEGORIES
        }

    def _create_suppliers(self):
        return [
            Supplier.objects.create(name=name, email=email)
            for name, email in SUPPLIERS
        ]

    def _create_products(self, categories, suppliers):
        products = []
        for name, category_name, supplier_idx, price in PRODUCTS:
            products.append(Product.objects.create(
                name=name,
                description=f'A quality {name.lower()} you will love.',
                price=Decimal(price),
                in_stock=random.random() > 0.15,
                category=categories[category_name],
                supplier=suppliers[supplier_idx],
            ))
        return products

    def _create_orders(self, products):
        for customer in CUSTOMERS:
            order = Order.objects.create(
                customer_name=customer,
                status=random.choice(Order.Status.values),
            )
            # 1-4 distinct products per order.
            for product in random.sample(products, random.randint(1, 4)):
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=random.randint(1, 3),
                    unit_price=product.price,
                )
