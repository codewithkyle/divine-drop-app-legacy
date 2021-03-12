# File Storage

How-to guide for accessing the S3 file storage system. For additional information about S3 read the [AWS S3 documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html).
## Namespace

```php
use App\Facades\File;
```

## Create or Update

```php
$key = "my-unique-file-key";
$path = "/uploads/uploaded-file.pdf";
File::Put($key, $path);
```

## Get

```php
$key = "my-unique-file-key";
$result = File::Get($key);
```

## Delete

```php
$key = "my-unique-file-key";
$result = File::Delete($key);
```