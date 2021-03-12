# Image Service

For information on requesting images from the API read the [images how-to guide](/how-to/images).
```php
use App\Services\ImageService;

$imageService = new ImageService();
```

## Deleting Images

```php
$imageService->deleteImage(string $uid, int $userId);
```

## Saving Images

```php
$imageUid = $imageService->saveImage(UploadedFile $uploadedFile, int $userId, string $uid = null);
```

## Transforming Images

```php
$file = $imageService->getTransformedImage(string $uid, int $userId, array $params);
```

> **Note:** image transformation are performed using [Jitter](https://github.com/codewithkyle/jitter/blob/master/readme.md#using-jitter).