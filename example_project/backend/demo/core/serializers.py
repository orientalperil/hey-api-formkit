from rest_framework import serializers

from core.models import Category, Order, OrderItem, Product, Supplier


class LoginSerializer(serializers.Serializer):
    """Request body for the login endpoint."""

    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})


class TokenSerializer(serializers.Serializer):
    """Login response: the auth token to send as ``Authorization: Bearer``."""

    token = serializers.CharField(read_only=True)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'email']


class ProductSerializer(serializers.ModelSerializer):
    # Writable foreign keys by primary key, with read-only human-readable labels.
    category_name = serializers.CharField(source='category.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'in_stock', 'created_at',
            'category', 'category_name', 'supplier', 'supplier_name',
        ]
        read_only_fields = ['id', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    # Writable and optional: the client sends the item's `pk` back when
    # editing an existing line item so `OrderSerializer.update()` can match it
    # up, and omits it for a new row. Overriding the field is required
    # because ModelSerializer marks the pk read-only by default.
    pk = serializers.IntegerField(required=False)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['pk', 'product', 'product_name', 'quantity', 'unit_price']


class OrderSerializer(serializers.ModelSerializer):
    # Nested writable items: create an order and its line items in one request.
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'status', 'created_at', 'items']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            item_data.pop('pk', None)
            OrderItem.objects.create(order=order, **item_data)
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            existing_items = {item.pk: item for item in instance.items.all()}
            kept_pks = set()
            for item_data in items_data:
                item_pk = item_data.pop('pk', None)
                existing_item = existing_items.get(item_pk)
                if existing_item is not None:
                    for attr, value in item_data.items():
                        setattr(existing_item, attr, value)
                    existing_item.save()
                    kept_pks.add(item_pk)
                else:
                    new_item = OrderItem.objects.create(order=instance, **item_data)
                    kept_pks.add(new_item.pk)
            for item_pk, item in existing_items.items():
                if item_pk not in kept_pks:
                    item.delete()

        return instance
