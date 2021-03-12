# Rehyrdating NDJSON Files

In this tutorial we will be creating a job that will rehydrate the data in an NJDSON file. For additional information about streaming NDJSON files read the [Streams—The definitive guide](https://web.dev/streams/) article by Thomas Steiner.

We will start by adding a new Job to the `Server/app/Jobs/` directory.

```php
<?php

namespace App\Jobs;

use Log;
use Ramsey\Uuid\Uuid;
use Illuminate\Support\Facades\Cache;

use App\Models\Example;

class RefreshExamplesFileJob extends Job
{
    private $uid;

    public function __construct()
    {
        $this->uid = Uuid::uuid4()->toString();
    }

    public function handle()
    {
        // ...
    }
}
```

The `handle()` function is called when the job runs. Usually jobs are automatically triggered by the [Laravel queue worker](https://laravel.com/docs/8.x/queues#running-the-queue-worker). Let's add the this jobs logic to the `handle()` function.

```php
$finalPath = storage_path("ndjson/examples.ndjson");
$tempPath = storage_path("ndjson/" . $this->uid . ".tmp");
file_put_contents($tempPath, "");
Example::orderBy("updated_at", "DESC")->chunk(200, function ($examples) {
    $tempPath = storage_path("ndjson/" . $this->uid . ".tmp");
    foreach ($examples as $example) {
        $line =
            json_encode([
                "Title" => $examples->title,
            ]) . "\n";
        file_put_contents($tempPath, $line, FILE_APPEND);
    }
});
rename($tempPath, $finalPath);

// Performance Tip: when updating the NDJSON data query and cache the count value
$total = Example::count();
Cache::set("example-count", $total);
```

That's it! Now all we need to do is to queue this job the in `ExampleService` class `save()` method.

```php
private function save()
{
    $this->example->save();
    Queue::push(new RefreshExamlesFileJob());
}
```