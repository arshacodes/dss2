<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Optional: factory-generated users
        // \App\Models\User::factory(10)->create();

        // Call your custom user seeder
        $this->call(UserSeeder::class);
        $this->call(ProductSeeder::class);
    }
}