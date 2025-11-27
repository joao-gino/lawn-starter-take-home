<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SwapiController extends Controller
{
    public function proxy(Request $request, $resource, $id = null)
    {
        $baseUrl = 'https://swapi.tech/api';
        $url = $baseUrl . '/' . $resource . ($id ? '/' . $id : '');

        $response = Http::get($url, $request->query());

        abort_unless($response->successful(), $response->status(), $response->json('message', 'SWAPI error'));

        return response()->json($response->json(), $response->status());
    }
}