<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Cart;

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
            'buyer_id' => $buyer->id,
            'total_price' => $total,
        ]);

        foreach ($orderItems as $item) {
            $order->items()->create($item);
        }

        return response()->json(['message' => 'Order placed successfully']);
    }

    public function index(Request $request)
    {
        $orders = Order::with('items.product.seller')
            ->where('buyer_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function checkout(Request $request)
    {
        $buyer = $request->user();
        $cart = Cart::with('items.product')->where('user_id', $buyer->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        $total = 0;
        $orderItems = [];

        foreach ($cart->items as $item) {
            $product = $item->product;

            if ($product->stock < $item->quantity) {
                return response()->json(['error' => 'Insufficient stock for ' . $product->name], 400);
            }

            $product->stock -= $item->quantity;
            $product->sales += $item->quantity;
            $product->save();

            $orderItems[] = [
                'product_id' => $product->id,
                'quantity' => $item->quantity,
                'price' => $product->price,
            ];

            $total += $product->price * $item->quantity;
        }

        $order = Order::create([
            'buyer_id' => $buyer->id,
            'total_price' => $total,
        ]);

        foreach ($orderItems as $item) {
            $order->items()->create($item);
        }

        // Clear the cart
        $cart->items()->delete();

        return response()->json(['message' => 'Order placed successfully', 'order' => $order]);
    }

    public function cancel(Request $request, Order $order)
    {
        // Ensure the order belongs to the authenticated user
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Only allow cancellation if status is 'to ship'
        if ($order->status !== 'to ship') {
            return response()->json(['error' => 'Order cannot be cancelled at this stage'], 400);
        }

        // Restore product stock
        foreach ($order->items as $item) {
            $product = $item->product;
            $product->stock += $item->quantity;
            $product->sales -= $item->quantity;
            $product->save();
        }

        // Update order status
        $order->status = 'cancelled';
        $order->save();

        return response()->json(['message' => 'Order cancelled successfully']);
    }

    public function markAsReceived(Request $request, Order $order)
    {
        // Ensure the order belongs to the authenticated user
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Only allow marking as received if status is 'to receive'
        if ($order->status !== 'to receive') {
            return response()->json(['error' => 'Order cannot be marked as received at this stage'], 400);
        }

        // Update order status
        $order->status = 'received';
        $order->save();

        return response()->json(['message' => 'Order marked as received successfully']);
    }

    public function sellerOrders(Request $request)
    {
        $seller = $request->user();

        $orders = Order::with(['items.product', 'buyer'])
            ->whereHas('items.product', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|string|in:to ship,to receive,received,cancelled'
        ]);

        $seller = $request->user();

        // Ensure the seller owns at least one product in this order
        $hasProduct = $order->items()->whereHas('product', function ($query) use ($seller) {
            $query->where('seller_id', $seller->id);
        })->exists();

        if (!$hasProduct) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $newStatus = $request->input('status');

        // Validate status transitions
        $validTransitions = [
            'to ship' => ['to receive', 'cancelled'],
            'to receive' => ['received'],
            'received' => [], // Cannot change from received
            'cancelled' => [] // Cannot change from cancelled
        ];

        if (!in_array($newStatus, $validTransitions[$order->status] ?? [])) {
            return response()->json(['error' => 'Invalid status transition'], 400);
        }

        // If cancelling, restore stock
        if ($newStatus === 'cancelled') {
            foreach ($order->items as $item) {
                $product = $item->product;
                if ($product->seller_id === $seller->id) {
                    $product->stock += $item->quantity;
                    $product->sales -= $item->quantity;
                    $product->save();
                }
            }
        }

        $order->status = $newStatus;
        $order->save();

        return response()->json(['message' => 'Order status updated successfully']);
    }

    public function dashboard(Request $request)
    {
        $seller = $request->user();

        // Total revenue from completed orders
        $totalRevenue = Order::whereHas('items.product', function ($query) use ($seller) {
            $query->where('seller_id', $seller->id);
        })
        ->where('status', 'received')
        ->sum('total_price');

        // Revenue change percentage (compare with previous period)
        $currentMonth = now()->startOfMonth();
        $previousMonth = now()->subMonth()->startOfMonth();

        $currentRevenue = Order::whereHas('items.product', function ($query) use ($seller) {
            $query->where('seller_id', $seller->id);
        })
        ->where('status', 'received')
        ->whereBetween('created_at', [$currentMonth, now()])
        ->sum('total_price');

        $previousRevenue = Order::whereHas('items.product', function ($query) use ($seller) {
            $query->where('seller_id', $seller->id);
        })
        ->where('status', 'received')
        ->whereBetween('created_at', [$previousMonth, $currentMonth])
        ->sum('total_price');

        $revenueChange = $previousRevenue > 0 ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;

        // Top selling products
        $topProducts = Product::where('seller_id', $seller->id)
            ->orderBy('sales', 'desc')
            ->limit(5)
            ->get(['name', 'sales', 'price']);

        // Recent orders (last 10)
        $recentOrders = Order::with(['items.product', 'buyer'])
            ->whereHas('items.product', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Sales data for the last 7 days
        $salesData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $dailyRevenue = Order::whereHas('items.product', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->where('status', 'received')
            ->whereDate('created_at', $date)
            ->sum('total_price');

            $salesData[] = [
                'date' => $date,
                'revenue' => $dailyRevenue
            ];
        }

        return response()->json([
            'totalRevenue' => $totalRevenue,
            'revenueChange' => round($revenueChange, 2),
            'topProducts' => $topProducts,
            'recentOrders' => $recentOrders,
            'salesData' => $salesData
        ]);
    }
}
