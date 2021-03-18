<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->group(["prefix" => "v1"], function () use ($router) {
    $router->post("register", "AuthController@register");
    $router->post("login", "AuthController@login");
    $router->get("verify-email", "AuthController@verifyEmail");
    $router->post("forgot-password", "AuthController@forgotPassword");
    $router->post("reset-password", "AuthController@resetPassword");
    $router->get("maintenance", "AuthController@maintenanceCheck");
    $router->post("impersonate", "AuthController@impersonate");

    $router->group(["middleware" => "user"], function () use ($router) {
        $router->post("refresh-token", "AuthController@refreshToken");
        $router->post("resend-verification-email", "AuthController@resendVerificationEmail");
        $router->post("logout", "AuthController@logout");
        $router->get("image/{uid}", "FileController@getImage");
        $router->get("image/card/{uid}", "FileController@getCardImage");
        $router->get("file/{uid}", "FileController@getFile");
        $router->post("deck", "DeckController@updateDeck");
        $router->get("deck/{uid}", "DeckController@getDeck");
        $router->delete("deck/{uid}", "DeckController@deleteDeck");
    });

    $router->group(["prefix" => "user", "middleware" => "user"], function () use ($router) {
        $router->get("verify", "UserController@verify");
        $router->get("profile", "UserController@profile");
        $router->post("profile", "UserController@updateProfile");
        $router->delete("profile", "UserController@deleteProfile");
        $router->post("update-password", "AuthController@updatePassword");
        $router->post("profile/avatar", "UserController@updateProfileAvatar");
    });

    $router->group(["prefix" => "admin", "middleware" => ["admin"]], function () use ($router) {
        $router->get("verify", "AdminController@verify");
        $router->get("users", "AdminController@getUsers");
        $router->post("ban", "AdminController@banUser");
        $router->post("unban", "AdminController@unbanUser");
        $router->post("activate", "AdminController@activateUser");
        $router->post("send-activation-email", "AdminController@sendActivationEmail");
        $router->post("revoke-admin-status", "AdminController@revokeAdminStatus");
        $router->post("grant-admin-status", "AdminController@grantAdminStatus");
        $router->post("impersonation-link", "AuthController@getImpersonationLink");
        $router->post("clear-redis-cache", "AdminController@clearRedisCache");
        $router->post("clear-ndjson-cache", "AdminController@clearNDJSONCache");
        $router->post("set-maintenance-mode", "AdminController@setMaintenanceMode");
        $router->post("purge/transformed-images", "AdminController@purgeTransformedImages");
    });

    $router->group(["prefix" => "ingest"], function () use ($router) {
        $router->get("cards", "IngestController@getCards");
        $router->head("cards", "IngestController@getCardsHead");
        $router->get("cards/count", "IngestController@countCards");

        $router->group(["middleware" => ["admin"]], function () use ($router) {
            $router->get("users", "IngestController@getUsers");
            $router->head("users", "IngestController@getUsersHead");
            $router->get("users/count", "IngestController@countUsers");
            $router->post("card", "IngestController@addCard");
        });

        $router->group(["middleware" => ["user"]], function () use ($router) {
            $router->get("decks", "IngestController@getDecks");
            $router->head("decks", "IngestController@getDecksHead");
            $router->get("decks/count", "IngestController@countDecks");
        });
    });
});
