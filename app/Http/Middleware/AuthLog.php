<?php /** @noinspection PhpUndefinedFieldInspection */
/** @noinspection PhpUnhandledExceptionInspection */
/** @noinspection PhpUndefinedMethodInspection */

/** @noinspection DuplicatedCode */

namespace App\Http\Middleware;

use App\Models\User\UserLog;
use Carbon\Carbon;
use Closure;
use hisorange\BrowserDetect\Parser as Browser;
use Illuminate\Http\Request;
use Ramsey\Uuid\Uuid;

class AuthLog
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
        if (auth()->guard('api')->user() != null) {
            $logs = UserLog::where('user', auth()->guard('api')->user()->id)->whereDate('created_at','>',Carbon::now()->addSeconds(-30))->first();
            if ($logs == null) {
                $logs = new UserLog();
                $logs->id = Uuid::uuid4()->toString();
                $logs->user = auth()->guard('api')->user()->id;
                $logs->url = $request->fullUrl();
                $logs->method = strtolower($request->method());
                $logs->params = $request->all();
                $logs->ip = $request->ip();
                $logs->browser = Browser::browserFamily() . ' ' . Browser::browserVersion();
                $logs->platform = Browser::platformName();
                $logs->saveOrFail();
            }
        }
        return $next($request);
    }
}
