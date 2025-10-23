<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;

class CartItemController extends Controller
{
    public function show(Request $request, Cart $cart)
    {
        $items = CartItem::where('cart_id', $cart->id)->get();
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $item = CartItem::updateOrCreate(
            ['cart_id' => $cart->id, 'product_id' => $request->product_id],
            ['quantity' => \DB::raw("quantity + {$request->quantity}")]
        );

        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::findOrFail($id);

        if ($item->cart->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $item->update(['quantity' => $request->quantity]);

        return response()->json($item);
    }

    public function destroy(Request $request, $id)
    {
        $item = CartItem::findOrFail($id);

        if ($item->cart->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $item->delete();

        return response()->json(['message' => 'Item removed']);
    }
}