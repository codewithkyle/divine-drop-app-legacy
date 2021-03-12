# Validation

```php
public function exampleEndpoint(Request $request): JsonResponse
{
    $validator = Validator::make($request->all(), [
        "name" => "required|max:255",
        "email" => "required|email|max:255",
    ]);
    if ($validator->fails()) {
        return $this->buildValidationErrorResponse($validator, "Example form contains errors.");
    }

    // ...snip...
}
```