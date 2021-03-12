# Creating Jobs

Create jobs in the `Server/app/Jobs/` directory.

```php
<?php

namespace App\Jobs;

class ExampleJob extends Job
{
    public function __construct()
    {
        // ...
    }

    public function handle()
    {
        // Job logic goes here
    }
}
```