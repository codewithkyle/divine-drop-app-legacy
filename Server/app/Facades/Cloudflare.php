<?php

namespace App\Facades;

use Log;

use Cloudflare\API\Auth\APIKey;
use Cloudflare\API\Adapter\Guzzle;
use Cloudflare\API\Endpoints\Zones;

class Cloudflare
{
    public static function Flush(): bool
    {
        $cfEmail = getenv("CLOUDFLARE_EMAIL_ADDRESS");
        $cfKey = getenv("CLOUDFLARE_API_KEY");
        if (empty($cfEmail) || empty($cfKey)) {
            return false;
        }
        $key = new APIKey($cfEmail, $cfKey);
        $adapter = new Guzzle($key);
        $zones = new Zones($adapter);
        foreach ($zones->listZones()->result as $zone) {
            $zones->cachePurgeEverything($zone->id);
        }
        return true;
    }
}
