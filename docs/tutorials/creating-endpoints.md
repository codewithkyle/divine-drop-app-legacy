# Creating Endpoints

Creating endpoints starts with adding the endpoint to the Router. You can do this by editing the `Server/routes/api.php` file. You can learn more about routing by reading the [Laravel routing documentation](https://laravel.com/docs/8.x/routing).

```php
$router->get("example", "ExampleController@getExampleData");
```

Now we need to create our controller in the `Server/app/Http/Controllers/` directory.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

class ExampleController extends Controller
{
    // ...
}
```

Then within our new controller class we will need to add our endpoint's function.

```php
public function getExampleData(Request $request): JsonResponse
{
    $data = ["foo", "bar", "baz"];
    return $this->buildSuccessResponse($data);
}
```

If we needed to identify our user we can access the `User` model that's injected into the request.

```php
$user = $request->user;
```

That's it! At this point we can continue to add new endpoints to our controller. If we need to perform business logic (outside of parameter validation) we will need to [create a service](/tutorials/creating-services).