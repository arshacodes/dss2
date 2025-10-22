<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = Cart::with('items.product')
            ->firstOrCreate(['userr_id' => $request->user()->id]);

        return response()->json($cart);
    }
}