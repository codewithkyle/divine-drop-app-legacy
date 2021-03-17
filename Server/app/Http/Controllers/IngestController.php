<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

use App\Services\IngestService;

class IngestController extends Controller
{
    public function getDecksHead(Request $request)
    {
        $ingestService = new IngestService();
        $decks = $ingestService->getDecks($request->user->id);
        $count = $ingestService->countDecks($request->user->id);
        $etag = $this->generateDataEtag($decks, $count);
        return response("")->header("ingest-version", $etag);
    }

    public function getDecks(Request $request)
    {
        $ingestService = new IngestService();
        $decks = $ingestService->getDecks($request->user->id);
        $response = "";
        foreach ($decks as $deck) {
            $response .= \json_encode($deck) . "\n";
        }
        return response($response, 200);
    }

    public function countDecks(Request $request)
    {
        $ingestService = new IngestService();
        $count = $ingestService->countDecks($request->user->id);
        return $this->buildSuccessResponse($count);
    }

    public function addCard(Request $request)
    {
        try {
            $front = null;
            $back = null;
            if (!is_null($request->input("front"))) {
                $front = $this->parseBase64Image($request->input("front"));
            }
            if (!is_null($request->input("back"))) {
                $back = $this->parseBase64Image($request->input("back"));
            }
            $ingestService = new IngestService();
            $ingestService->addCard($request->all(), $front, $back);
        } catch (Exception $e) {
            return response($e->getMessage(), 500);
        }
        return response("Success", 200);
    }

    public function getCards(Request $request)
    {
        $path = storage_path("ndjson/cards.ndjson");
        $etag = $this->generateEtag($path);
        return response(file_get_contents($path))->header("ingest-version", $etag);
    }

    public function countCards(Request $request): JsonResponse
    {
        $ingestService = new IngestService();
        $data = $ingestService->countCards();
        return $this->buildSuccessResponse($data);
    }

    public function getUsers(Request $request)
    {
        try {
            $accepts = $this->validateAcceptHeader($request, ["application/x-ndjson", "application/json"]);
        } catch (Exception $e) {
            return response($e->getMessage(), $e->getStatusCode());
        }
        switch ($accepts) {
            case "application/x-ndjson":
                $path = storage_path("ndjson/users.ndjson");
                $etag = $this->generateEtag($path);
                return response(file_get_contents($path))->header("ingest-version", $etag);
            case "application/json":
                $ingestService = new IngestService();
                $data = $ingestService->getAllUsers();
                return $this->buildSuccessResponse($data);
        }
    }

    public function getCardsHead(Request $request)
    {
        $path = storage_path("ndjson/cards.ndjson");
        $etag = $this->generateEtag($path);
        return response("")->header("ingest-version", $etag);
    }

    public function getUsersHead(Request $request)
    {
        $path = storage_path("ndjson/users.ndjson");
        $etag = $this->generateEtag($path);
        return response("")->header("ingest-version", $etag);
    }

    public function countUsers(Request $request): JsonResponse
    {
        $ingestService = new IngestService();
        $data = $ingestService->countUsers();
        return $this->buildSuccessResponse($data);
    }
}
