<?php

namespace App\Jobs;

use Log;
use Ramsey\Uuid\Uuid;
use Illuminate\Support\Facades\Cache;

use App\Models\User;

class RefreshUsersFileJob extends UniqueJob
{
    private $uid;

    public function __construct()
    {
        $this->uid = Uuid::uuid4()->toString();
    }

    public function handle()
    {
        $finalPath = storage_path("ndjson/users.ndjson");
        $tempPath = storage_path("ndjson/" . $this->uid . ".tmp");
        file_put_contents($tempPath, "");
        User::orderBy("updated_at", "DESC")->chunk(200, function ($users) {
            $tempPath = storage_path("ndjson/" . $this->uid . ".tmp");
            foreach ($users as $user) {
                $line =
                    json_encode([
                        "Name" => $user->name,
                        "Email" => $user->email,
                        "Uid" => $user->uid,
                        "Suspended" => boolval($user->suspended),
                        "Verified" => boolval($user->verified),
                        "Admin" => boolval($user->admin),
                    ]) . "\n";
                file_put_contents($tempPath, $line, FILE_APPEND);
            }
        });
        rename($tempPath, $finalPath);
        $total = User::count();
        Cache::set("user-count", $total);
    }
}
