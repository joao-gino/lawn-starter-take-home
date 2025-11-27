<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\InputBag;

class SwapiController extends Controller
{
    public function proxy(Request $request, $resource, $identifier = null)
    {
        $baseUrl = 'https://swapi.dev/api';
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