<?php

namespace App\Services;

use Log;
use Ramsey\Uuid\Uuid;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

use App\Models\Deck;
use App\Models\Card;

class DeckService
{
    private $user;

    function __construct($user)
    {
        $this->user = $user;
    }

    public function getDecks(): array
    {
        $decks = Deck::where("userId", $this->user->id)->get();
        $output = [];
        foreach ($decks as $deck) {
            $output[] = [
                "UID" => $deck->uid,
                "Name" => $deck->name,
                "Commander" => $deck->commander,
                "Cards" => $deck->cards,
            ];
        }
        return $output;
    }

    public function getDeck(string $uid): array
    {
        $deck = Deck::where([
            "userId" => $this->user->id,
            "uid" => $uid,
        ])->first();
        if (empty($deck)) {
            throw new Exception(404, "Deck doesn't exist.");
        } else {
            return [
                "UID" => $deck->uid,
                "Name" => $deck->name,
                "Commander" => $deck->commander,
                "Cards" => $deck->cards,
            ];
        }
    }

    public function deleteDeck(string $uid): void
    {
        $deck = Deck::where("uid", $uid)->first();
        if (!empty($deck)) {
            if ($deck->userId !== $this->user->id) {
                throw new Exception(401, "You do not have permission to delete this deck.");
            } else {
                $deck->delete();
            }
        }
    }

    public function updateDeck(array $params): string
    {
        if (isset($params["UID"]) && !is_null($params["UID"])) {
            $deck = Deck::where("uid", $params["UID"])->first();
            if (empty($deck)) {
                throw new Exception(404, "Deck doesn't exist.");
            } elseif ($deck->userId !== $this->user->id) {
                throw new Exception(401, "You do not have permission to update this deck.");
            }
            $deck->name = $params["Name"];
            $deck->cards = $params["Cards"];
            $deck->commander = $params["Commander"];
            $deck->save();
        } else {
            $deck = Deck::create([
                "name" => $params["name"],
                "uid" => Uuid::uuid4()->toString(),
                "cards" => [],
                "userId" => $this->user->id,
            ]);
        }
        return $deck->uid;
    }
}
