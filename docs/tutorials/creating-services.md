# Creating Services

Within service classes is where most of the business logic should be performed. You can create a new service class file in the `Server/app/Services/` directory.

```php
<?php

namespace App\Services;

use Log;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

class ExampleService
{
    // ...
}
```

Services will often be used to manipulate a model.

```php
use App\Models\Example;

class ExampleService
{
    private $examle;

    function __construct(Example $example)
    {
        $this->example = $example;
    }
}
```

When creating this type of service you should create an alias for the models `save()` and `delete()` methods.

```php
private function save()
{
    $this->example->save();
    // Caching
    // Queue a job
    // Etc...
}
private function delete()
{
    $this->example->delete();
    // Remove from caching
    // Queue a job
    // Etc...
}
```

This allows us to easily add events, queue jobs, or add/remove caching layers without having to rewrite/edit every function within the service class.

```php
public function updateTitle(string $title): void
{
    $this->example->title = $title;
    $this->save();
}
```

When writing a service function make sure you use the `Exception` class to handle errors.

```php
class ExampleService
{
    private $examle;
    private $user;

    function __construct(Example $example, User $user)
    {
        $this->example = $example;
        $this->user = $user;
    }

    public function deleteExample(string $title)
    {
        if ($user->can("example:delete"))
        {
            $this->delete();
        }
        else
        {
            throw new Exception(401, "You do not have permission to delete this example.");
        }
    }
}
```

For more information about managing user permissions read the [user permissions how-to guide](/how-to/user-permissions).