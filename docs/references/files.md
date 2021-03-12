# File Service

For information about accessing files in S3 read the [file storage how-to guide](/how-to/file-storage).

```php
use App\Services\FileService;

$fileService = new FileService();
```

## Saving Files

```php
$fileUid = $fileService->saveFile(UploadedFile $uploadedFile, int $userId, string $uid = null);
```

## Deleting Files

```php
$fileService->deleteFile(string $uid, int $userId);
```

## Getting S3 Keys

```php
$key = $fileService->getKey(string $uid, int $userId);
```

## Getting Files

```php
$file = $fileService->getFile(string $uid, int $userId);
```
