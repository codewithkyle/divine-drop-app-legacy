# Redis Cache

For technical information read the [Laravel cache reference documentation](https://laravel.com/docs/8.x/cache).

## Namespace

```php
use Illuminate\Support\Facades\Cache;
```

## Create or Update

```php
$data = "Hello world";
Cache::put("uniqueKey", $data);
```

## Read

```php
$fallback = "Goodbye world";
$cachedData = Cache::get("uniqueKey", $fallback);
```

## Delete

```php
Cache::forget("uniqueKey");
```