<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class Language
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if (auth()->guard('api')->user() !== null) {
            $me = auth()->guard('api')->user();
            $tgtDir = storage_path() . '/framework/cookies/langs/';
            $tgtFile = $me->id . '.json';
            if (File::exists($tgtDir . $tgtFile)) {
                $fileContent = File::get($tgtDir . $tgtFile,false);
                $fileContent = json_decode($fileContent);
                $fileContent = $fileContent->lang;
                app()->setLocale($fileContent);
            }
        }
        return $next($request);
    }
}
