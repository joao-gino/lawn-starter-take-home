<?php

namespace App\Http\Controllers;

use App\Jobs\LogRequestEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\InputBag;

class SwapiController extends Controller
{
    private string $endpoint = '/swapi/';

    public function proxy(Request $request, $resource, $identifier = null)
    {
        $startedAt = microtime(true);

        $baseUrl = env('SWAPI_BASE_URL');
        $resourcePath = $this->mountResourcePath($resource);
        if ($identifier) {
            $resourcePath .= '/' . $identifier;
        }
        $url = rtrim($baseUrl . '/' . $resourcePath, '/');

        $queryParams = $request->query();
        if ($queryParams instanceof InputBag) {
            $queryParams = $queryParams->all();
        }

        $response = Http::get($url, $queryParams);

        abort_unless($response->successful(), $response->status(), $response->json('detail', 'SWAPI error'));

        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);

        LogRequestEvent::dispatch($this->endpoint . $resource, $durationMs);

        return response()->json($response->json(), $response->status());
    }

    private function mountResourcePath($resource, $identifier = null)
    {
        return match ($resource) {
            'people' => $identifier ? "people/$identifier" : 'people',
            'movies' => $identifier ? "films/$identifier" : 'films',
            default => throw new InvalidArgumentException("Invalid resource: $resource"),
        };
    }
}