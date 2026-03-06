<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get factory IDs (assumes FactorySeeder already ran)
//        $factory1Id = DB::table('factories')->where('code', 'F01')->value('id');
//        $factory2Id = DB::table('factories')->where('code', 'F02')->value('id');

        $factory1Id = 1;
        $factory2Id = 2;

        DB::table('users')->insert([
            [
                'name' => 'Admin User',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'factory_id' => null,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Manager One',
                'email' => 'manager1@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'factory_id' => $factory1Id,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Manager Two',
                'email' => 'manager2@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'factory_id' => $factory2Id,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Staff One',
                'email' => 'staff1@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'factory_id' => $factory1Id,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Staff Two',
                'email' => 'staff2@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'factory_id' => $factory2Id,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
