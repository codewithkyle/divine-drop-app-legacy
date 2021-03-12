<?php

namespace App\Facades;

use Log;
use Aws\S3\S3Client;
use Aws\S3\Exception\S3Exception;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

class File
{
    public static function Put(string $key, string $path)
    {
        $s3 = self::S3Client();
        try {
            $s3->putObject([
                "Bucket" => getenv("S3_BUCKET"),
                "Key" => $key,
                "Body" => fopen($path, "r"),
            ]);
        } catch (S3Exception $e) {
            throw new Exception(500, $e->getMessage());
        }
    }

    public static function Get(string $key)
    {
        $s3 = self::S3Client();
        $result = null;
        try {
            $result = $s3->getObject([
                "Bucket" => getenv("S3_BUCKET"),
                "Key" => $key,
            ]);
        } catch (S3Exception $e) {
            throw new Exception(500, $e->getMessage());
        }
        return $result;
    }

    public static function Delete(string $key)
    {
        $s3 = self::S3Client();
        $result = null;
        try {
            $result = $s3->deleteObject([
                "Bucket" => getenv("S3_BUCKET"),
                "Key" => $key,
            ]);
        } catch (S3Exception $e) {
            throw new Exception(500, $e->getMessage());
        }
        return $result;
    }

    public static function GetURL(string $key, int $minutes = 30): string
    {
        $s3 = self::S3Client();
        $result = null;
        try {
            $cmd = $s3Client->getCommand("GetObject", [
                "Bucket" => getenv("S3_BUCKET"),
                "Key" => $key,
            ]);
            $request = $s3Client->createPresignedRequest($cmd, "+" . $minutes . " minutes");
            $result = (string) $request->getUri();
        } catch (S3Exception $e) {
            throw new Exception(500, $e->getMessage());
        }
        return $result;
    }

    private static function S3Client(): S3Client
    {
        $s3 = new S3Client([
            "version" => "latest",
            "region" => getenv("S3_REGION"),
            "credentials" => [
                "key" => getenv("AWS_S3_ACCESS_KEY_ID"),
                "secret" => getenv("AWS_S3_SECRET_KEY"),
            ],
        ]);
        return $s3;
    }
}
