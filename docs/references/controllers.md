# Controllers

For additional information about controllers read the [Laravel controller documentation](https://laravel.com/docs/8.x/controllers).

## Validating Accept Headers

```php
$this->validateAcceptHeader(Request $request, array $accepts = ["application/json"]): string
```

## Build Form Error Responses

```php
$this->buildValidationErrorResponse(Validator $validator, string $error = "Something went wrong on the server."): JsonResponse
```

## Build Error Responses

```php
$this->buildErrorResponse(string $error = "Something went wrong on the server.", $data = null): JsonResponse
```

## Building Success Responses

```php
$this->buildSuccessResponse($data = null): JsonResponse
```

## Building Unauthorized Responses

```php
$this->returnUnauthorized(string $error = "You are not authorized to preform this action."): JsonResponse
```

## Parsing Base64 Image Strings

```php
$this->parseBase64Image(string $base64File): UploadedFile
```

## Generating File ETag Values

```php
$this->generateEtag(string $path): string
```