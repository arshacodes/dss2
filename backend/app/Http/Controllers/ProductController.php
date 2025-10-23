<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Product;

// public function store(Request $request)
class ProductController extends Controller
{
    
    use AuthorizesRequests;
    // app/Http/Controllers/ProductController.php
    public function index(Request $request)
    {
        // return Product::where('seller_id', auth()->id())->get();
        return response()->json(Product::all());
    }

    public function show($id)
    {
        $product = Product::with('seller')->findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        \Log::info('=== Product Store Debug ===');
        \Log::info('Headers:', $request->headers->all());
        \Log::info('Bearer Token:', [$request->bearerToken()]);
        \Log::info('Auth User:', [auth()->user()]);
        \Log::info('Auth Check:', [auth()->check()]);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'required|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $validated['seller_id'] = auth()->id();
        $validated['sales'] = 0;

        return Product::create($validated);
    }

    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        $product->delete();
        return response()->noContent();
    }

    // public function addToCart(Request $request, Product $product)
    // {
    //     \Log::info('=== Product Store Debug ===');
    //     \Log::info('Headers:', $request->headers->all());
    //     \Log::info('Bearer Token:', [$request->bearerToken()]);
    //     \Log::info('Auth User:', [auth()->user()]);
    //     \Log::info('Auth Check:', [auth()->check()]);
        
    //     $validated = $request->validate([
    //         // 'name' => 'required|string|max:255',
    //         // 'description' => 'required|string',
    //         // 'price' => 'required|numeric|min:0',
    //         // 'stock' => 'required|integer|min:0',
    //         // 'image' => 'required|image|max:2048',
    //         'product_id'
    //     ]);

    //     if ($request->hasFile('image')) {
    //         $validated['image'] = $request->file('image')->store('products', 'public');
    //     }

    //     $validated['seller_id'] = auth()->id();
    //     $validated['sales'] = 0;

    //     return Product::create($validated);
    // }
}
