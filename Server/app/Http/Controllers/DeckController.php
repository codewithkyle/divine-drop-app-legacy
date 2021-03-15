<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

use App\Services\DeckService;

class DeckController extends Controller
{
    public function getDecks(Request $request): JsonResponse
    {
        $service = new DeckService($request->user);
        $decks = $service->getDecks();
        return $this->buildSuccessResponse($decks);
    }

    public function getDeck(string $uid, Request $request): JsonResponse
    {
        $service = new DeckService($request->user);
        $deck = $service->getDeck($uid);
        if (empty($deck)){
            return $this->buildErrorResponse("Deck doesn't exist.");
        }
        return $this->buildSuccessResponse($decks);
    }

    public function deleteDeck(string $uid, Request $request): JsonResponse
    {
        $service = new DeckService($request->user);
        try {
            $service->deleteDeck($uid);
        } catch (Exception $e) {
            $this->buildErrorResponse($e->getMessage());
        }
        return $this->buildSuccessResponse();
    }

    public function updateDeck(Request $request): JsonResponse
    {
        $service = new DeckService($request->user);
        try {
            $service->updateDeck($request->all());
        } catch (Exception $e) {
            $this->buildErrorResponse($e->getMessage());
        }
        return $this->buildSuccessResponse();
    }
}
