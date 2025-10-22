<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\User;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // $sellers = User::where('account_type', 'seller')->get();

        // foreach ($sellers as $seller) {
            Product::create([
                'name' => 'Wireless Mouse',
                'description' => 'Ergonomic wireless mouse with adjustable DPI.',
                'price' => 899.00,
                'stock' => 50,
                'sales' => 120,
                'image' => 'products/mouse.jpg',
                'seller_id' => 1
            ]);

            Product::create([
                'name' => 'Mechanical Keyboard',
                'description' => 'RGB backlit mechanical keyboard with blue switches.',
                'price' => 2499.00,
                'stock' => 30,
                'sales' => 200,
                'image' => 'products/keyboard.jpg',
                'seller_id' => 2
            ]);
        // }
    }
}