# Ingesting Data

Ingest endpoints are the main way we feed data into the clients application. Data can be served as `application/json` and `application/x-ndjson` content types. In this example we will be adding a new endpoint to the `Server/app/Http/Controllers/IngestController.php` file. To learn more about updating/maintaining the NDJSON files read the [rehyrdating NDJSON files tutorial](/tutorials/rehydrating-ndjson).

To being we will need to set up our routes in the `Server/routes/api.php` file. Ingest endpoints require three routes, one for getting the data, one for getting the `HEAD` and one for getting the count. Add the routes to the router group with the `ingest` prefix.

```php
$router->get("example", "IngestController@getExamples");
$router->head("example", "IngestController@getExamplesHead");
$router->get("example/count", "IngestController@countExamples");
```

Now in the `Server/app/Http/Controllers/IngestController.php` file we will start by adding the `getExamples()` method.

```php
public function getExamples(Request $request)
{
    // ...
}
```

The first step is to determine what type of data we need to respond with.

```php
public function getExamples(Request $request)
{
    try {
        $accepts = $this->validateAcceptHeader($request, ["application/x-ndjson", "application/json"]);
    } catch (Exception $e) {
        return response($e->getMessage(), $e->statusCode);
    }
}
```

Once we have the requested content type we can respond with the data.

```php
public function getExamples(Request $request)
{
    // ...snip...

    switch ($accepts) {
        case "application/x-ndjson":
            $path = storage_path("ndjson/examples.ndjson");
            $etag = $this->generateEtag($path);
            return response(file_get_contents($path))->header("ETag", $etag);
        case "application/json":
            $ingestService = new IngestService();
            $data = $ingestService->getAllExamples();
            return $this->buildSuccessResponse($data);
    }
}
```

While we're still in the controller let's add our other two methods.

```php
public function getExamplesHead(Request $request)
{
    $path = storage_path("ndjson/examples.ndjson");
    $etag = $this->generateEtag($path);
    return response("")->header("ETag", $etag);
}

public function countExamples(Request $request): JsonResponse
{
    $ingestService = new IngestService();
    $data = $ingestService->countExamples();
    return $this->buildSuccessResponse($data);
}
```

Now let's add business logic functions to the `Server/app/Services/IngestService.php` file.

```php
use App\Models\Example;

public function getAllExamples(): array
{
    $output = [];
    $examples = Example::get();
    foreach ($examples as $example) {
        $output[] = [
            "Title" => $example->title,
        ];
    }
    return $output;
}

public function countExamples()
{
    // Performance Tip: cache this value in Redis and update the value when the NDJSON refresh job runs
    $count = Example::count();
    return $count;
}
```

