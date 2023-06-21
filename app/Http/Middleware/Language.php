<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;

class Language
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure(Request): (Response|RedirectResponse) $next
     * @return Response|RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->hasHeader('Language')) {
            app()->setLocale($request->header('Language'));
        } else {
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
        }
        return $next($request);
    }
}
