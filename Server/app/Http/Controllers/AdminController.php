<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

use App\Facades\Cloudflare;
use App\Services\UserService;
use App\Services\AdminService;
use App\Models\User;
use App\Jobs\RefreshUsersFileJob;

class AdminController extends Controller
{
    public function verify(Request $request): JsonResponse
    {
        return $this->buildSuccessResponse();
    }

    public function getUsers(Request $request): JsonResponse
    {
        $adminService = new AdminService();
        $page = $request->input("p", 0);
        $limit = $request->input("limit", 10);
        $data = $adminService->getUsers($page, $limit);
        return $this->buildSuccessResponse($data);
    }

    public function banUser(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "uid" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Request is missing uid parameter.");
        }

        $uid = $request->input("uid");
        $user = User::where("uid", $uid)->first();
        if (!empty($user)) {
            $userService = new UserService($user);
            $userService->suspend();
            return $this->buildSuccessResponse();
        } else {
            return $this->buildErrorResponse("Failed to find user to suspend.");
        }
    }

    public function unbanUser(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "uid" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Request is missing uid parameter.");
        }

        $uid = $request->input("uid");
        $user = User::where("uid", $uid)->first();
        if (!empty($user)) {
            $userService = new UserService($user);
            $userService->unsuspend();
            return $this->buildSuccessResponse();
        } else {
            return $this->buildErrorResponse("Failed to find user to unsuspend.");
        }
    }

    public function activateUser(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "uid" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Request is missing uid parameter.");
        }

        $uid = $request->input("uid");
        $user = User::where("uid", $uid)->first();
        if (!empty($user)) {
            $userService = new UserService($user);
            $userService->activate();
            return $this->buildSuccessResponse();
        } else {
            return $this->buildErrorResponse("Failed to find user to unsuspend.");
        }
    }

    public function sendActivationEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "uid" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Request is missing uid parameter.");
        }

        $uid = $request->input("uid");
        $user = User::where("uid", $uid)->first();
        if (!empty($user)) {
            $userService = new UserService($user);
            $userService->resendVerificationEmail();
            return $this->buildSuccessResponse();
        } else {
            return $this->buildErrorResponse("Failed to find user to unsuspend.");
        }
    }

    public function revokeAdminStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "uid" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Request is missing uid parameter.");
        }

        $uid = $request->input("uid");
        $user = User::where("uid", $uid)->first();
        if (!empty($user)) {
            $userService = new UserService($user);
            $userService->revokeAdminStatus();
            return $this->buildSuccessResponse();
        } else {
            return $this->buildErrorResponse("Failed to find user to unsuspend.");
        }
    }

    public function grantAdminStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "uid" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Request is missing uid parameter.");
        }

        $uid = $request->input("uid");
        $user = User::where("uid", $uid)->first();
        if (!empty($user)) {
            $userService = new UserService($user);
            $userService->grantAdminStatus();
            return $this->buildSuccessResponse();
        } else {
            return $this->buildErrorResponse("Failed to find user to unsuspend.");
        }
    }

    public function clearRedisCache(Request $request): JsonResponse
    {
        $isInMaintenance = Cache::get("maintenance", false);
        Cache::flush();
        if ($isInMaintenance) {
            Cache::set("maintenance", true);
        }
        return $this->buildSuccessResponse();
    }

    public function clearNDJSONCache(Request $request): JsonResponse
    {
        Queue::push(new RefreshUsersFileJob());
        return $this->buildSuccessResponse();
    }

    public function clearCloudflareCache(Request $request): JsonResponse
    {
        $success = Cloudflare::flush();
        if ($success) {
            return $this->buildSuccessResponse();
        } else {
            return $this->buildErrorResponse("Failed to clear Cloudflare cache.");
        }
    }

    public function setMaintenanceMode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "maintenance" => "required|bool",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Request is missing 'maintenance' parameter.");
        }
        $isInMaintenance = $request->input("maintenance", false);
        Cache::set("maintenance", $isInMaintenance);
        return $this->buildSuccessResponse();
    }
}
