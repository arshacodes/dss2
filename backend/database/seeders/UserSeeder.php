<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Tina', 'email' => 'tina@gmail.com', 'password' => Hash::make('tinabels'), 'account_type' => 'seller'],
            ['name' => 'Zen', 'email' => 'zen@gmail.com', 'password' => Hash::make('zenmode1'), 'account_type' => 'seller'],
            ['name' => 'Khan', 'email' => 'khan@gmail.com', 'password' => Hash::make('khankhan'), 'account_type' => 'buyer'],
            ['name' => 'Ivy', 'email' => 'ivy@gmail.com', 'password' => Hash::make('12345678'), 'account_type' => 'buyer'],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}