<?php

namespace App\Services;

use Log;

use App\Models\User;

class AdminService
{
    public function getUsers(int $page, int $limit)
    {
        $output = [
            "users" => [],
            "total" => User::count(),
        ];
        $offset = $page * $limit;
        $users = User::limit($limit)
            ->offset($offset)
            ->get();
        foreach ($users as $user) {
            $output["users"][] = [
                "Name" => $user->name,
                "Email" => $user->email,
                "Uid" => $user->uid,
                "Groups" => $user->groups,
                "Suspended" => (bool) $user->suspended,
                "Verified" => (bool) $user->verified,
                "Admin" => (bool) $user->admin,
                "Avatar" => $user->avatar,
            ];
        }
        return $output;
    }
}
