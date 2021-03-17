<?php

/**
 * @copyright Copyright (c) Kyle Andrews <codingwithkyle@gmail.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

namespace codewithkyle\JitterCore;

use Imagick;

class Jitter
{
    public static function TransformImage(string $tempImage, array $transform, string $resizeOn = null): void
    {
        self::doImageTransform($tempImage, $transform, $resizeOn);
        self::convertImageFormat($tempImage, $transform);
    }

    public static function BuildTransform(array $params, int $baseImageWidth, int $baseImageHeight, string $fallbackFormat = "png"): array
    {
        $clientAcceptsWebp = strpos($_SERVER["HTTP_ACCEPT"], "image/webp") !== false;
        $width = $baseImageWidth;
        $height = $baseImageHeight;
        $aspectRatioValues = [$width, $height];
        if (isset($params["ar"])) {
            $values = explode(":", $params["ar"]);
            if (count($values) == 2) {
                $aspectRatioValues = [intval($values[0]), intval($values[1])];
            }
        }

        if (isset($params["w"]) && isset($params["h"])) {
            $width = intval($params["w"]);
            $height = intval($params["h"]);
        } elseif (isset($params["w"])) {
            $width = intval($params["w"]);
            $height = ($aspectRatioValues[1] / $aspectRatioValues[0]) * $width;
        } elseif (isset($params["h"])) {
            $height = intval($params["h"]);
            $width = ($aspectRatioValues[0] / $aspectRatioValues[1]) * $height;
        }

        $quality = 80;
        if (isset($params["q"])) {
            $quality = intval($params["q"]);
        }

        $mode = "clip";
        if (isset($params["m"])) {
            $mode = $params["m"];
        }

        $bg = "ffffff";
        if (isset($params["bg"])) {
            $bg = ltrim($params["bg"], "#");
        }

        $focusPoints = [];
        if (isset($params["fp-x"]) && isset($params["fp-y"])) {
            $focusPoints[0] = floatval($params["fp-x"]);
            if ($focusPoints[0] < 0) {
                $focusPoints[0] = 0;
            }
            if ($focusPoints[0] > 1) {
                $focusPoints[0] = 1;
            }

            $focusPoints[1] = floatval($params["fp-y"]);
            if ($focusPoints[1] < 0) {
                $focusPoints[1] = 0;
            }
            if ($focusPoints[1] > 1) {
                $focusPoints[1] = 1;
            }
        } else {
            $focusPoints = [0.5, 0.5];
        }

        $format = "auto";
        if (isset($params["fm"])) {
            switch ($params["fm"]) {
                case "gif":
                    $format = "gif";
                    break;
                case "jpeg":
                    $format = "jpeg";
                    break;
                case "webp":
                    if (!$clientAcceptsWebp){
                        $format = $fallbackFormat;
                    } else {
                        $format = "webp";
                    }
                    break;
                case "png":
                    $format = "png";
                    break;
                default:
                    $format = "auto";
                    break;
            }
        }
        if ($format === "auto") {
            if ($clientAcceptsWebp) {
                $format = "webp";
            } else {
                $format = $fallbackFormat;
            }
        }

        $transform = [
            "width" => round($width),
            "height" => round($height),
            "format" => $format,
            "mode" => $mode,
            "quality" => $quality,
            "background" => $bg,
            "focusPoint" => $focusPoints,
        ];
        return $transform;
    }

    private static function doImageTransform(string $tempImage, array $transform, string $resizeOn = null): void
    {
        $img = new Imagick($tempImage);
        $img->setImageCompression(Imagick::COMPRESSION_NO);
        $img->setImageCompressionQuality(100);
        $img->setOption("png:compression-level", "9");

        switch ($transform["mode"]) {
            case "fit":
                $img->resizeImage($transform["width"], $transform["height"], Imagick::FILTER_LANCZOS, 0.75);
                $img->writeImage($tempImage);
                break;
            case "letterbox":
                $img->setImageBackgroundColor("#" . $transform["background"]);
                $img->thumbnailImage($transform["width"], $transform["height"], true, true);
                $img->writeImage($tempImage);
                break;
            case "crop":
                $leftPos = floor($img->getImageWidth() * $transform["focusPoint"][0]) - floor($transform["width"] / 2);
                $topPos = floor($img->getImageHeight() * $transform["focusPoint"][1]) - floor($transform["height"] / 2);
                $img->cropImage($transform["width"], $transform["height"], $leftPos, $topPos);
                $img->writeImage($tempImage);
                break;
            default:
                if (is_null($resizeOn)) {
                    if ($transform["width"] < $transform["height"]) {
                        $img->resizeImage($transform["width"], null, Imagick::FILTER_LANCZOS, 0.75);
                    } elseif ($transform["height"] < $transform["width"]) {
                        $img->resizeImage(null, $transform["height"], Imagick::FILTER_LANCZOS, 0.75);
                    } else {
                        $rawWidth = $img->getImageWidth();
                        $rawHeight = $img->getImageHeight();
                        if ($rawWidth < $rawHeight) {
                            $img->resizeImage($transform["width"], null, Imagick::FILTER_LANCZOS, 0.75);
                        } elseif ($rawHeight < $rawWidth) {
                            $img->resizeImage(null, $transform["height"], Imagick::FILTER_LANCZOS, 0.75);
                        } else {
                            $img->resizeImage($transform["width"], $transform["height"], Imagick::FILTER_LANCZOS, 0.75);
                        }
                    }
                } else {
                    if ($resizeOn === "height" || $resizeOn === "h") {
                        $img->resizeImage(null, $transform["height"], Imagick::FILTER_LANCZOS, 0.75);
                    } else {
                        $img->resizeImage($transform["width"], null, Imagick::FILTER_LANCZOS, 0.75);
                    }
                }

                $leftPos = floor($img->getImageWidth() * $transform["focusPoint"][0]) - floor($transform["width"] / 2);
                $topPos = floor($img->getImageHeight() * $transform["focusPoint"][1]) - floor($transform["height"] / 2);
                $img->cropImage($transform["width"], $transform["height"], $leftPos, $topPos);
                $img->writeImage($tempImage);
                break;
        }
    }

    private static function convertImageFormat(string $tempImage, array $transform): void
    {
        $img = new Imagick($tempImage);
        switch ($transform["format"]) {
            case "jpeg":
                $img->setImageFormat("jpeg");
                $img->setImageCompressionQuality($transform["quality"]);
                $img->writeImage($tempImage);
                break;
            case "jpg":
                $img->setImageFormat("jpeg");
                $img->setImageCompressionQuality($transform["quality"]);
                $img->writeImage($tempImage);
                break;
            case "gif":
                $img->setImageFormat("gif");
                $img->setImageCompressionQuality($transform["quality"]);
                $img->writeImage($tempImage);
                break;
            case "png":
                $img->setImageFormat("png");
                $img->setImageCompressionQuality($transform["quality"]);
                $img->writeImage($tempImage);
                break;
            case "webp":
                if (\count(\Imagick::queryFormats("WEBP")) > 0 || file_exists("/usr/bin/cwebp")) {
                    if (\count(\Imagick::queryFormats("WEBP")) > 0) {
                        $img->setImageFormat("webp");
                        $img->setImageCompressionQuality($transform["quality"]);
                        $img->writeImage($tempImage);
                    } elseif (file_exists("/usr/bin/cwebp")) {
                        $command = escapeshellcmd("/usr/bin/cwebp -q " . $transform["quality"] . " " . $tempImage . " -o " . $tempImage);
                        shell_exec($command);
                    }
                }
                break;
            default:
                break;
        }
    }
}