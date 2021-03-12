<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Firebase\JWT\JWT;
use Ramsey\Uuid\Uuid;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

// Models
use App\Models\User;
use App\Models\EmailVerification;
use App\Models\PasswordReset;

// Services
use App\Services\UserService;

class AuthController extends Controller
{
    public function impersonate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "token" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Request is missing token parameter.");
        }
        $token = $request->input("token");
        $this->setAuthCookie($token, time() + 900);
        return $this->buildSuccessResponse();
    }

    public function getImpersonationLink(Request $request): JsonResponse
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
            $data = $this->generateToken($user->uid, 900);
            return $this->buildSuccessResponse($data);
        } else {
            return $this->buildErrorResponse("Failed to find user to unsuspend.");
        }
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "email" => "required|email",
            "password" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Login form contains errors.");
        }

        $email = $request->input("email");
        $password = $request->input("password");
        $user = User::where("email", $email)->first();

        if (empty($user)) {
            $error = "An account with the email " . $email . " does not exists.";
            return $this->buildErrorResponse($error);
        }

        if (Hash::check($password, $user->password)) {
            if ($user->suspended) {
                return $this->returnUnauthorized("Your account has been suspended.");
            }
            $maintenance = Cache::get("maintenance", false);
            if ($maintenance && !$user->admin) {
                return $this->buildErrorResponse("The server is currently undergoing maintenance.");
            }
            $data = $this->generateToken($user->uid);
            Cache::put("user-" . $user->uid, json_encode($user));
            $this->setAuthCookie($data["token"], $data["expires"]);
            return $this->buildSuccessResponse([
                "pendingEmailVerification" => $user->verified ? false : true,
            ]);
        } else {
            return $this->buildErrorResponse("Incorrect email or password.");
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $this->blacklistToken($request->token, $request->payload->exp);
        if (isset($_COOKIE["JWT"])) {
            unset($_COOKIE["JWT"]);
            setcookie("JWT", "", time() - 3600, "/");
        }
        return $this->buildSuccessResponse();
    }

    public function refreshToken(Request $request): JsonResponse
    {
        $newToken = $this->generateToken($request->user->uid);
        if ($newToken["token"] !== $request->token) {
            $this->blacklistToken($request->token, $request->payload->exp);
        }
        $this->setAuthCookie($newToken["token"], $newToken["expires"]);
        return $this->buildSuccessResponse();
    }

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "email" => "required|email|unique:users|max:255",
            "password" => "required|min:6|max:255",
            "name" => "required|max:255",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Registration form contains errors.");
        }

        $email = $request->input("email");
        $password = Hash::make($request->input("password"));
        $name = $request->input("name");

        $uid = Uuid::uuid4()->toString();

        $user = User::create([
            "name" => $name,
            "email" => $email,
            "password" => $password,
            "uid" => $uid,
            "groups" => ["global"],
        ]);

        $userService = new UserService($user);
        $userService->createEmailVerification($email);

        return $this->buildSuccessResponse();
    }

    public function verifyEmail(Request $request)
    {
        $success = false;
        $data = $request->input("code");
        $verificationRequest = EmailVerification::where("emailVerificationCode", $data)->first();
        if (!empty($verificationRequest)) {
            $user = User::where("id", $verificationRequest->userId)->first();
            if (!empty($user)) {
                $userService = new UserService($user);
                $userService->verifyEmailAddress($verificationRequest);
                $success = true;
            }
        }
        if ($success) {
            return redirect(rtrim(env("APP_URL"), "/") . "/verification/success");
        } else {
            return redirect(rtrim(env("APP_URL"), "/") . "/verification/error");
        }
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user;
        $userService = new UserService($user);
        $userService->resendVerificationEmail();
        return $this->buildSuccessResponse($request->user);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "newPassword" => "required|min:6|max:255",
            "oldPassword" => "required|min:6|max:255",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Password update form contains errors.");
        }

        $user = User::where("id", $request->user->id)->first();
        if (!empty($user)) {
            if (Hash::check($request->input("oldPassword"), $user->password)) {
                $newPassword = Hash::make($request->input("newPassword"));
                $user->password = $newPassword;
                $user->save();
                return $this->buildSuccessResponse();
            } else {
                return $this->buildErrorResponse("Incorrect current password.");
            }
        } else {
            return $this->buildErrorResponse("Failed to find user.");
        }
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "email" => "required|max:255|email",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Forgotten password form contains errors.");
        }

        $email = $request->input("email");

        $user = User::where("email", $email)->first();
        if (!empty($user)) {
            $userService = new UserService($user);
            $userService->createPasswordReset();
            return $this->buildSuccessResponse();
        } else {
            return $this->buildErrorResponse("Failed to find user with the email " . $email . ".");
        }
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            "password" => "required|min:6|max:255",
            "code" => "required",
        ]);
        if ($validator->fails()) {
            return $this->buildValidationErrorResponse($validator, "Password reset form contains errors.");
        }

        $password = Hash::make($request->input("password"));
        $code = $request->input("code");

        $resetRequest = PasswordReset::where("emailVerificationCode", $code)->first();
        if (!empty($resetRequest)) {
            $user = User::where("id", $resetRequest->userId)->first();
            if (!empty($user)) {
                $userService = new UserService($user);
                $userService->resetPassword($password);
                return $this->buildSuccessResponse();
            } else {
                return $this->buildErrorResponse("Failed to find your account.");
            }
        } else {
            return $this->buildErrorResponse("Failed to find password reset request. The request might have expired.");
        }
    }

    public function maintenanceCheck(Request $request): JsonResponse
    {
        return $this->buildSuccessResponse(Cache::get("maintenance", false));
    }

    private function generateToken(string $userUid, int $duraiton = null): array
    {
        if (is_null($duraiton)) {
            $duraiton = env("JWT_TIMEOUT");
        }
        $iat = time();
        $exp = $iat + $duraiton;
        $payload = [
            "iss" => env("API_URL"),
            "iat" => $iat,
            "nbf" => $iat,
            "exp" => $exp,
            "sub" => $userUid,
        ];
        $token = JWT::encode($payload, env("JWT_SECRET"), "HS256");
        return [
            "token" => $token,
            "type" => "bearer",
            "expires" => $exp,
        ];
    }

    private function blacklistToken(string $token, int $exp): void
    {
        $blacklist = Cache::get("blacklist", json_encode([]));
        $blacklist = json_decode($blacklist, true);
        $blacklist[] = [
            "token" => $token,
            "exp" => $exp,
        ];
        Cache::put("blacklist", json_encode($blacklist));
    }

    private function setAuthCookie(string $token, int $expires): void
    {
        setcookie("JWT", $token, $expires, "/", "", false, true);
    }
}
