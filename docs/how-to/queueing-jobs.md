# Queueing Jobs

For additional information about the Queue read the [Laravel Queue documentation](https://laravel.com/docs/8.x/queues).

## Namespace

```php
use Illuminate\Support\Facades\Queue;
```

## Queue a Job

```php
use App\Jobs\ExampleJob;

Queue::push(new ExampleJob());
```
