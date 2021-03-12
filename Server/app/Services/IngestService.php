<?php

namespace App\Services;

use Log;
use Illuminate\Support\Facades\Cache;

use App\Models\User;

class IngestService
{
    public function getAllUsers(): array
    {
        $output = [];
        $users = User::get();
        foreach ($users as $user) {
            $output[] = [
                "Name" => $user->name,
                "Email" => $user->email,
                "Uid" => $user->uid,
                "Suspended" => boolval($user->suspended),
                "Verified" => boolval($user->verified),
                "Admin" => boolval($user->admin),
            ];
        }
        return $output;
    }

    public function countUsers(): int
    {
        $count = Cache::get("user-count", null);
        if (is_null($count)) {
            $count = User::count();
        }
        return (int) $count;
    }
}
