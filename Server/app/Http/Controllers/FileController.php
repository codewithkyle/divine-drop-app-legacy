<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

use App\Services\FileService;
use App\Services\ImageService;
use App\Facades\File;

class FileController extends Controller
{
    public function getImage(string $uid, Request $request)
    {
        try {
            $imageService = new ImageService();
            $response = $imageService->getTransformedImage($uid, $request->user->id, $request->all());
            return response($response["Body"], 200, [
                "Content-Type" => $response["ContentType"],
                "Access-Control-Allow-Credentials" => "true",
                "Access-Control-Allow-Origin" => rtrim(getenv("APP_URL"), "/"),
                "Access-Control-Allow-Methods" => "GET, OPTIONS",
                "Access-Control-Max-Age" => "86400",
                "Cache-Control" => "public",
                "Access-Control-Allow-Headers" => "Content-Type, Authorization, X-Requested-With, Accept",
            ]);
        } catch (Exception $e) {
            return response($e->getMessage(), $e->getStatusCode());
        }
    }

    public function getFile(string $uid, Request $request)
    {
        try {
            $fileService = new FileService();
            $response = $fileService->getFile($uid, $request->user->id);
            return response($response["Body"], 200, [
                "Content-Type" => $response["ContentType"],
                "Access-Control-Allow-Credentials" => "true",
                "Access-Control-Allow-Origin" => rtrim(getenv("APP_URL"), "/"),
                "Access-Control-Allow-Methods" => "GET, OPTIONS",
                "Access-Control-Max-Age" => "86400",
                "Cache-Control" => "public",
                "Access-Control-Allow-Headers" => "Content-Type, Authorization, X-Requested-With, Accept",
            ]);
        } catch (Exception $e) {
            return response($e->getMessage(), $e->getStatusCode());
        }
    }
}
