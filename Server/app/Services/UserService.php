<?php

namespace App\Services;

use Log;
use Ramsey\Uuid\Uuid;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Symfony\Component\HttpKernel\Exception\HttpException as Exception;

// Models
use App\Models\User;
use App\Models\EmailVerification;
use App\Models\PasswordReset;

// Emails
use App\Mail\EmailConfirm;
use App\Mail\ForgottenPassword;
use App\Mail\PasswordChanged;

// Services
use App\Services\FileService;
use App\Services\ImageService;

// Jobs
use App\Jobs\RefreshUsersFileJob;

class UserService
{
    /** @var User */
    private $user;

    function __construct($user)
    {
        $this->user = User::where("id", $user->id)->first();
    }

    protected $permissions = [
        "global" => ["profile:update", "image:create", "image:delete"],
    ];

    public function updateAvatar(UploadedFile $photo): void
    {
        if ($this->can("image:create")) {
            $imageService = new ImageService();
            if (!is_null($this->user->avatar)) {
                $this->deleteAvatar();
            }
            $imageUid = $imageService->saveImage($photo, $this->user->id);
            $this->user->avatar = rtrim(getenv("API_URL"), "/") . "/v1/image/" . $imageUid;
            $this->save();
        } else {
            throw new Exception(401, "You do not have permission to upload a new profile picture.");
        }
    }

    public function delete(): void
    {
        if (!is_null($this->user->avatar)) {
            $this->deleteAvatar();
        }
        $this->user->delete();
        Cache::forget("user-" . $this->user->uid);
        Queue::push(new RefreshUsersFileJob());
    }

    public function grantAdminStatus(): void
    {
        $this->user->admin = true;
        $this->save();
    }

    public function revokeAdminStatus(): void
    {
        $this->user->admin = false;
        $this->save();
    }

    public function activate(): void
    {
        $this->user->verified = true;
        $this->purgeEmailVerificationRequests();
        $this->save();
    }

    public function suspend(): void
    {
        $this->user->suspended = true;
        $this->user->admin = false;
        // Add a suspension email here
        $this->save();
    }

    public function unsuspend(): void
    {
        $this->user->suspended = false;
        $this->save();
    }

    public function addGroup(string $groupToAdd): void
    {
        if (isset($this->permissions[$groupToAdd]) && !in_array($this->user->groups, $groupToAdd)) {
            $updatedGroups = [$groupToAdd];
            foreach ($this->user->groups as $group) {
                $updatedGroups[] = $group;
            }
            $this->user->groups = $updatedGroups;
            $this->save();
        }
    }

    public function removeGroup(string $groupToRemove): void
    {
        if (in_array($groupToRemove, $this->user->groups)) {
            $updatedGroups = [];
            foreach ($this->user->groups as $userGroup) {
                if ($userGroup !== $groupToRemove) {
                    $updatedGroups[] = $userGroup;
                }
            }
            $this->user->groups = $updatedGroups;
            $this->save();
        }
    }

    public function can(string $permission): bool
    {
        $allowed = false;
        foreach ($this->user->groups as $group) {
            if (in_array($permission, $this->permissions[$group])) {
                $allowed = true;
                break;
            }
        }
        return $allowed;
    }

    public function createEmailVerification(string $email): void
    {
        $verificationCode = Uuid::uuid4()->toString();

        $encodedData = $this->encodeData(
            json_encode([
                "email" => $email,
                "code" => $verificationCode,
            ])
        );

        $verification = EmailVerification::create([
            "emailVerificationCode" => $encodedData,
            "userId" => $this->user->id,
            "email" => $email,
        ]);

        $mail = new EmailConfirm($encodedData, $this->user->name);
        $this->sendMail($email, $mail);
        $this->save();
    }

    public function resendVerificationEmail(): void
    {
        $verificationRequest = EmailVerification::where("userId", $this->user->id)
            ->whereNotNull("emailVerificationCode")
            ->first();
        $mail = new EmailConfirm($verificationRequest->emailVerificationCode, $this->user->name);
        $this->sendMail($verificationRequest->email, $mail);
    }

    public function verifyEmailAddress(EmailVerification $verificationRequest): void
    {
        $this->user->email = $verificationRequest->email;
        $this->user->verified = true;
        $this->save();
        $this->purgeEmailVerificationRequests();
    }

    public function updateProfile(array $params): void
    {
        if ($this->can("profile:update")) {
            $this->user->name = $params["name"];
            if ($this->user->email !== $params["email"]) {
                $temp = User::where("email", $params["email"])->first();
                if (!empty($temp)) {
                    if ($temp->id !== $this->user->id) {
                        throw new Exception(406, "This email address has already been taken.");
                    }
                } else {
                    $this->createEmailVerification($params["email"]);
                }
            }
            $this->save();
        } else {
            throw new Exception(401, "You do not have permission to update your profile.");
        }
    }

    public function createPasswordReset(): void
    {
        $verificationCode = Uuid::uuid4()->toString();
        $encodedData = $this->encodeData($verificationCode);
        $passwordResetRequeset = PasswordReset::create([
            "userId" => $this->user->id,
            "emailVerificationCode" => $encodedData,
        ]);
        $mail = new ForgottenPassword($passwordResetRequeset->emailVerificationCode, $this->user->name);
        $this->sendMail($this->user->email, $mail);
    }

    public function resetPassword(string $password): void
    {
        $this->user->password = $password;
        $this->save();
        $this->prugePasswordResetRequests();
        $mail = new PasswordChanged($this->user->name);
        $this->sendMail($this->user->email, $mail);
    }

    private function prugePasswordResetRequests(): void
    {
        $requests = PasswordReset::where("userId", $this->user->id)
            ->whereNotNull("emailVerificationCode")
            ->get();
        foreach ($requests as $request) {
            $request->emailVerificationCode = null;
            $request->save();
        }
    }

    private function purgeEmailVerificationRequests(): void
    {
        $requests = EmailVerification::where("userId", $this->user->id)
            ->whereNotNull("emailVerificationCode")
            ->get();
        foreach ($requests as $request) {
            $request->emailVerificationCode = null;
            $request->save();
        }
    }

    private function save()
    {
        $this->user->save();
        Cache::put("user-" . $this->user->uid, json_encode($this->user));
        Queue::push(new RefreshUsersFileJob());
    }

    private function sendMail(string $email, \Illuminate\Mail\Mailable $mail): void
    {
        try {
            Mail::to($email)->send($mail);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }

    private function encodeData(string $data): string
    {
        return base64_encode($data);
    }

    private function decodeData(string $encodedData): string
    {
        return base64_decode($encodedData);
    }

    private function deleteAvatar(): void
    {
        if ($this->can("image:delete")) {
            $matches = [];
            preg_match("/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/", $this->user->avatar, $matches);
            if (!empty($matches)) {
                $imageService = new ImageService();
                $imageService->deleteImage($matches[0], $this->user->id);
            }
        }
    }
}
