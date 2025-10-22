<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $buyer = $request->user();
        $items = $request->input('items');

        $total = 0;
        $orderItems = [];

        foreach ($items as $item) {
            $product = Product::findOrFail($item['product_id']);

            if ($product->stock < $item['quantity']) {
                return response()->json(['error' => 'Insufficient stock for ' . $product->name], 400);
            }

            $product->stock -= $item['quantity'];
            $product->sales += $item['quantity'];
            $product->save();

            $orderItems[] = [
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'price' => $product->price,
            ];

            $total += $product->price * $item['quantity'];
        }

        $order = Order::create([
            'user_id' => $buyer->id,
            'total_price' => $total,
        ]);

        foreach ($orderItems as $item) {
            $order->items()->create($item);
        }

        return response()->json(['message' => 'Order placed successfully']);
    }
}
