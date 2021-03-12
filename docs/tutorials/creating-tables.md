# Creating a Table

For additional information about database migrations read the [Laravel migration documentation](https://laravel.com/docs/8.x/migrations).

Run the following command:

```bash
# Replace 'examples' with your desired table name
php ./Server/artisan make:migration create_examples_table
```

Make sure the generated file includes the following table columns:

```php
$table->id()->autoIncrement();
$table->uuid("uid");
$table->timestamps();
```

Now that your table has been created and you've added the nessessary columns read the [creating a modle how-to guide](/how-to/create-a-model).
