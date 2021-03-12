# New Service

Create the file in `Server/app/Services`

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

> **Note:** if your service class is managing a model make sure you read the [creating services tutorial](/tutorials/creating-services).