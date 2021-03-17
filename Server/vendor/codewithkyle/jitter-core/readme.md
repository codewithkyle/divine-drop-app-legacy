# Jitter

Jitter is an image transformation library with an API is based on [Imgix](https://docs.imgix.com/apis/url). This library was created to be a simple and free alternative to an Imgix style service. It **does not and will not** have all the bells and whistles that other services/libraries offer. If you need something more advanced besides basic image transformations I suggest you pay for [Imgix](https://www.imgix.com/pricing).

## Requirements

This library requires PHP 7.2 or later and [ImageMagick](https://imagemagick.org/index.php).

## Installation

```bash
# Install the library via composer
composer require codewithkyle/jitter-core

# Optional webp support (recommended)
sudo apt install webp
```

## Using Jitter

Transforming images:

```php
use codewithkyle\jittercore\Jitter;

class ImageController
{
    public function transformImage()
    {
        $imageFilePath = "./my-image.jpg";
        list($width, $height, $type, $attr) = getimagesize($imageFilePath);
        $fallbackFormat = "jpg"; // image format fallback for when the format is set to 'auto' or 'webp' but the client doesn't support 'webp' (Safari <=13.1) -- defaults to 'png'
        $params = ["w" => 32, "ar" => "1:1"]; // See transformation parameter table below for more options
        $resizeOn = "w"; // used to determine what side of the image should be used when calculating the resize -- accepts 'width', 'w', 'height', or 'h' and null (default)

        $transformSettings = Jitter::BuildTransform($params, $width, $height, $fallbackFormat);
        Jitter::TransformImage($imageFilePath, $transformSettings, $resizeOn);
    }
}
```

Transformation parameters:

| Parameter     | Default                    | Description                     | Valid options                               |
| ------------- | -------------------------- | ------------------------------- | ------------------------------------------- |
| `w`           | base image width           | desired image width             | `int`                                       |
| `h`           | base image height          | desired image height            | `int`                                       |
| `ar`          | base image aspect ratio    | desired aspect ratio            | `int`:`int`                                 |
| `fm`          | `auto`                     | desired image format            | `jpg`, `jpeg`, `png`, `gif`, `webp`, `auto` |
| `q`           | `80`                       | desired image quality           | `0` to `100`                                |
| `m`           | `clip`                     | how the image should be resized | `crop`, `clip`, `fit`, `letterbox`          |
| `bg`          | `ffffff`                   | letterbox background color      | `hex`                                       |
| `fp-x`        | `0.5` or asset focal point | horizontal focus point          | `0` to `1`                                  |
| `fp-y`        | `0.5` or asset focal point | vertical focus point            | `0` to `1`                                  |

The `auto` format type will return a `webp` image when the server can generate the format and the client's browser supports the format.
