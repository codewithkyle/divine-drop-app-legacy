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

    public function getDecks()
    {
        $decks = Deck::where("userId", $this->user->id)->get();
        return $decks;
    }

    public function getDeck(string $uid)
    {
        $deck = Deck::where([
            "userId" => $this->user->id,
            "uid" => $uid,
        ])->first();
        return $deck;
    }

    public function deleteDeck(string $uid)
    {
        $deck = Deck::where("uid", $uid)->first();
        if (!empty($deck))
        {
            if ($deck->userId !== $this->user->id)
            {
                throw new Exception(401, "You do not have permission to delete this deck.");
            }
            else
            {
                $deck->delete();
            }
        }
    }

    public function updateDeck(array $params)
    {
        if (!is_null($params["uid"]))
        {
            $deck = Deck::where("uid", $uid)->first();
            if (empty($deck))
            {
                throw new Exception(404, "Deck doesn't exist.");
            }
            else if ($deck->userId !== $this->user->id)
            {
                throw new Exception(401, "You do not have permission to update this deck.");
            }
            $deck->name = $params["name"];
            $deck->cards = $params["cards"];
            $deck->commander = $params["commander"];
            $deck->save();
        }
        else {
            Deck::create([
                "name" => $params["name"],
                "uid" => Uuid::uuid4()->toString(),
                "cards" => [],
                "userId" => $this->user->id,
            ]);
        }
    }
}
