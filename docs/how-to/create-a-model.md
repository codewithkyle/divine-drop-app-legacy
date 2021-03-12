# Creating a Model

Create the file in `Server/app/Models`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExampleModel extends Model
{
    protected $fillable = ["uid"];

    protected $hidden = ["id", "created_at", "updated_at"];
}
```

> **Note:** models are manipulated by service classes. If your model will need a companion service class read the [how-to create a service class guide](/how-to/create-a-service).