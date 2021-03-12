<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminAuthenticate extends AuthCore
{
    public function handle(Request $request, Closure $next)
    {
        $request = $this->processRequest($request);

        if (\is_null($request)) {
            return $this->returnUnauthorized();
        }

        if (!$request->user->admin) {
            return $this->returnUnauthorized();
        }

        return $next($request);
    }
}
