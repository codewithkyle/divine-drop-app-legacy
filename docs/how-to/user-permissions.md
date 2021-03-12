# User Permissions

You can edit user permissions in the `Server/app/Services/UserService.php` file.

## Permissions

```php
protected $permissions = [
    "global" => ["profile:update", "image:create", "image:delete"],
    "customRole" => ["examle:create", "example:update"],
    "manager" => ["example:delete"],
];
```

## Managing User Permissions

```php
$user->addGroup("customRole");
$user->removeGroup("customRole");
```

## Checking Permissions

```php
if ($user->can("example:delete"))
{
    // This users has the required permissions to perform this action.
}
```
