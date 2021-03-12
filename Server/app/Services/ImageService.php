<?php

namespace App\Services;

use Log;
use Imagick;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Queue;
use codewithkyle\JitterCore\Jitter;

use App\Models\Image;
use App\Facades\File;
use App\Models\TransformedImage;
use App\Jobs\PurgeTransformedImagesJob;

class ImageService
{
    public function deleteImage(string $uid, int $userId): void
    {
        $image = Image::where("uid", $uid)->first();
        if (empty($image)) {
            throw new Exception(404, "Image does not exist.");
        } elseif ($image->userId !== $userId) {
            throw new Exception(401, "You do not have permission to view this image.");
        } else {
            File::Delete($image->key);
            $image->deleted = true;
            $image->save();
            Queue::push(new PurgeTransformedImagesJob($image->id));
        }
    }

    public function saveImage(UploadedFile $uploadedFile, int $userId, string $uid = null): string
    {
        $image = null;
        $key = null;
        if (!is_null($uid)) {
            $image = Image::where("uid", $uid)->first();
            if (empty($image)) {
                throw new Exception(404, "Image does not exist.");
            } elseif ($image->userId !== $userId) {
                throw new Exception(401, "You do not have permission to view this image.");
            } else {
                $key = $image->key;
            }
        }
        if (is_null($key)) {
            $image = $this->createImage($userId, $uploadedFile);
            $key = $image->key;
        }
        File::Put($key, $uploadedFile->getPathname());
        unlink($uploadedFile->getPathname());
        if ($image->deleted) {
            $image->deleted = false;
            $image->save();
        }
        return $image->uid;
    }

    public function getTransformedImage(string $uid, int $userId, array $params)
    {
        $image = Image::where("uid", $uid)->first();
        if (empty($image) || $image->deleted) {
            throw new Exception(404, "Image does not exist.");
        } elseif ($image->private && $image->userId !== $userId) {
            throw new Exception(401, "You do not have permission to view this image.");
        }

        $transform = Jitter::BuildTransform($params, $image->width, $image->height, $image->type);
        $token = $this->buildTransformToken($transform);
        $transformedImage = TransformedImage::where([
            "token" => $token,
            "imageId" => $image->id,
        ])->first();

        if (empty($transformedImage)) {
            $file = File::Get($image->key);
            $tempImage = storage_path("images") . "/" . Uuid::uuid4()->toString();
            file_put_contents($tempImage, $file["Body"]);
            $resizeOn = null;
            if ((isset($params["w"]) && !isset($params["h"])) || (isset($params["h"]) && !isset($params["w"]))) {
                if (isset($params["w"])) {
                    $resizeOn = "width";
                } else {
                    $resizeOn = "height";
                }
            }
            Jitter::TransformImage($tempImage, $transform, $resizeOn);
            $this->saveTransformedImage($tempImage, $token, $image->id);
            $file = [
                "Body" => file_get_contents($tempImage),
                "ContentType" => mime_content_type($tempImage),
            ];
            unlink($tempImage);
        } else {
            $file = File::Get($transformedImage->key);
            $file["ContentType"] = $transformedImage->mimeType;
        }

        return $file;
    }

    private function getTypeFromMimeType(string $path): string
    {
        $mimeType = mime_content_type($path);
        switch ($mimeType) {
            case "image/png":
                return "png";
            case "image/jpeg":
                return "jpg";
            case "image/jpg":
                return "jpg";
            case "image/gif":
                return "gif";
            case "image/webp":
                return "wepb";
            default:
                return "png";
        }
    }

    private function createImage(int $userId, UploadedFile $uploadedFile): Image
    {
        $uid = Uuid::uuid4()->toString();
        $key = Crypt::encrypt($uid);
        $img = new Imagick($uploadedFile->getPathname());
        $type = $this->getTypeFromMimeType($uploadedFile->getPathname());
        $image = Image::create([
            "uid" => $uid,
            "key" => $key,
            "userId" => $userId,
            "width" => $img->getImageWidth(),
            "height" => $img->getImageHeight(),
            "type" => $type,
        ]);
        return $image;
    }

    private function saveTransformedImage(string $imagePath, string $token, int $imageId): void
    {
        $uid = Uuid::uuid4()->toString();
        $key = Crypt::encrypt($uid);
        File::Put($key, $imagePath);
        TransformedImage::create([
            "key" => $key,
            "imageId" => $imageId,
            "uid" => $uid,
            "token" => $token,
            "mimeType" => mime_content_type($imagePath),
        ]);
    }

    private function buildTransformToken(array $transform): string
    {
        $key =
            $transform["width"] .
            "-" .
            $transform["height"] .
            "-" .
            $transform["focusPoint"][0] .
            "-" .
            $transform["focusPoint"][1] .
            "-" .
            $transform["quality"] .
            "-" .
            $transform["background"] .
            "-" .
            $transform["mode"] .
            "-" .
            $transform["format"];
        return \md5($key);
    }
}
