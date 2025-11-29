<?php

namespace App\Http\Controllers;

use App\Jobs\LogRequestEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\InputBag;

class SwapiController extends Controller
{
    private string $endpoint = '/swapi/';

    public function proxy(Request $request, $resource, $identifier = null)
    {
        $startedAt = microtime(true);

        $resourcePath = $this->mountResourcePath($resource, $identifier);
        $queryParams  = $request->query();
        if ($queryParams instanceof InputBag) {
            $queryParams = $queryParams->all();
        }

        $cacheKey = $this->buildCacheKey($resourcePath, $queryParams);

        $payload = Cache::remember(
            $cacheKey,
            now()->addHour(),
            function () use ($resourcePath, $queryParams) {
                $baseUrl = env('SWAPI_BASE_URL');
                $url = rtrim("{$baseUrl}/{$resourcePath}", '/');

                $response = Http::get($url, $queryParams);

                abort_unless(
                    $response->successful(),
                    $response->status(),
                    $response->json('detail', 'SWAPI error')
                );

                return $response->json();
            }
        );

        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);

        LogRequestEvent::dispatch(
            endpoint: "{$this->endpoint}{$resource}",
            duration: $durationMs,
        );

        return response()->json($payload);
    }

    private function mountResourcePath($resource, $identifier = null)
    {
        return match ($resource) {
            'people' => $identifier ? "people/$identifier" : 'people',
            'movies' => $identifier ? "films/$identifier" : 'films',
            default => throw new InvalidArgumentException("Invalid resource: $resource"),
        };
    }

    private function buildCacheKey(string $path, array $query = []): string
    {
        ksort($query);
        $suffix = empty($query) ? '' : ':' . http_build_query($query);
        return 'swapi:' . Str::slug($path, ':') . $suffix;
    }
}