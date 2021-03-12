# Creating Controllers

Create controllers in the `Server/app/Http/Controllers/` directory.

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