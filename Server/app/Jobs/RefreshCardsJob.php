<?php

namespace App\Jobs;

use Log;
use Ramsey\Uuid\Uuid;
use Illuminate\Support\Facades\Cache;

use App\Models\Card;

class RefreshCardsJob extends UniqueJob
{
    private $uid;

    public function __construct()
    {
        $this->uid = Uuid::uuid4()->toString();
    }

    public function handle()
    {
        $finalPath = storage_path("ndjson/cards.ndjson");
        $tempPath = storage_path("ndjson/" . $this->uid . ".tmp");
        file_put_contents($tempPath, "");
        Card::chunk(200, function ($cards) {
            $tempPath = storage_path("ndjson/" . $this->uid . ".tmp");
            foreach ($cards as $card) {
                $line =
                    json_encode([
                        "UID" => $card->uid,
                        "Name" => $card->name,
                        "Slug" => $card->slug,
                        "Layout" => $card->layout,
                        "Rarity" => $card->rarity,
                        "Type" => $card->type,
                        "Text" => $card->text,
                        "FlavorText" => $card->flavorText,
                        "Vitality" => $card->vitality,
                        "FaceNames" => $card->faceNames,
                        "ManaCosts" => $card->manaCosts,
                        "Subtypes" => $card->subtypes,
                        "Legalities" => $card->legalities,
                        "Colors" => $card->colors,
                        "Keywords" => $card->keywords,
                        "Front" => $card->front,
                        "Back" => $card->back,
                    ]) . "\n";
                file_put_contents($tempPath, $line, FILE_APPEND);
            }
        });
        rename($tempPath, $finalPath);
        $total = Card::count();
        Cache::set("cards-count", $total);
    }
}
