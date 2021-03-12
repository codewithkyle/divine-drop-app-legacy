<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Validator;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

class Controller extends BaseController
{
    protected function validateAcceptHeader(Request $request, array $accepts = ["application/json"]): string
    {
        $acceptHeader = $request->header("accept") ?? null;
        $output = null;
        $acceptedTypes = "";
        foreach ($accepts as $type) {
            if ($acceptHeader === $type) {
                $output = $type;
                break;
            }
            $acceptedTypes .= $type . ", ";
        }
        if (is_null($output)) {
            throw new Exception(406, "Invalid 'Accept' header. This method only accepts: " . rtrim($acceptedTypes, ", "));
        }
        return $output;
    }

    protected function buildValidationErrorResponse(Validator $validator, string $error = "Something went wrong on the server."): JsonResponse
    {
        $errors = [];
        foreach ($validator->errors()->all() as $err) {
            $errors[] = $err;
        }
        return response()->json([
            "success" => false,
            "data" => $errors,
            "error" => $error,
        ]);
    }

    protected function buildErrorResponse(string $error = "Something went wrong on the server.", $data = null): JsonResponse
    {
        return response()->json([
            "success" => false,
            "data" => $data,
            "error" => $error,
        ]);
    }

    protected function buildSuccessResponse($data = null): JsonResponse
    {
        return response()->json([
            "success" => true,
            "data" => $data,
            "error" => null,
        ]);
    }

    protected function returnUnauthorized(string $error = "You are not authorized to preform this action."): JsonResponse
    {
        return response()->json(
            [
                "success" => false,
                "data" => null,
                "error" => $error,
            ],
            401
        );
    }

    protected function parseBase64Image(string $base64File): UploadedFile
    {
        $fileData = base64_decode(preg_replace("#^data:\w+/\w+;base64,#i", "", $base64File));
        $storagePath = storage_path("uploads");
        $tmpFilePath = $storagePath . "/" . Uuid::uuid4()->toString();
        file_put_contents($tmpFilePath, $fileData);
        $tmpFile = new File($tmpFilePath);
        $file = new UploadedFile($tmpFile->getPathname(), $tmpFile->getFilename(), $tmpFile->getMimeType(), 0, true);
        return $file;
    }

    protected function generateEtag(string $path): string
    {
        return md5_file($path) . filesize($path) . filemtime($path);
    }
}
