<?php

namespace App\Services;

use Log;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

use App\Models\File;
use App\Facades\File as FileHelper;

class FileService
{
    public function saveFile(UploadedFile $uploadedFile, int $userId, string $uid = null): string
    {
        $file = null;
        $key = null;
        if (!is_null($uid)) {
            $file = File::where("uid", $uid)->first();
            if (empty($file)) {
                throw new Exception(404, "File does not exist.");
            } elseif ($file->userId !== $userId) {
                throw new Exception(401, "You do not have permission to view this file.");
            } else {
                $key = $file->key;
            }
        }
        if (is_null($key)) {
            $file = $this->createFile($userId);
            $key = $file->key;
        }
        FileHelper::Put($key, $uploadedFile->getPathname());
        unlink($uploadedFile->getPathname());
        if ($file->deleted) {
            $file->deleted = false;
            $file->save();
        }
        return $file->uid;
    }

    public function deleteFile(string $uid, int $userId): void
    {
        $file = File::where("uid", $uid)->first();
        if (empty($file)) {
            throw new Exception(404, "File does not exist.");
        } elseif ($file->userId !== $userId) {
            throw new Exception(401, "You do not have permission to view this file.");
        } else {
            FileHelper::Delete($file->key);
            $file->deleted = true;
            $file->save();
        }
    }

    public function getKey(string $uid, int $userId)
    {
        $file = File::where("uid", $uid)->first();
        if (empty($file)) {
            throw new Exception(404, "File does not exist.");
        }
        if ($file->userId !== $userId && $file->private) {
            throw new Exception(401, "You do not have permission to view this file.");
        }
        return $file->key;
    }

    public function getFile(string $uid, int $userId)
    {
        $key = $this->getKey($uid, $userId);
        $file = FileHelper::Get($key);
        if (empty($file)) {
            throw new Exception(404, "File does not exist.");
        }
        return $file;
    }

    private function createFile(int $userId): File
    {
        $uid = Uuid::uuid4()->toString();
        $key = Crypt::encrypt($uid);
        $file = File::create([
            "uid" => $uid,
            "key" => $key,
            "userId" => $userId,
        ]);
        return $file;
    }
}
