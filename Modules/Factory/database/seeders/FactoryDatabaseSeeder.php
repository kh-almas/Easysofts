<?php

namespace Modules\Factory\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FactoryDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // $this->call([]);

//        $this->call([
//            FactorySeeder::class,
//        ]);

        DB::table('factories')->insert([
            [
                'name' => 'Factory 01',
                'code' => 'F01',
                'address' => 'Dhaka',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Factory 02',
                'code' => 'F02',
                'address' => 'Barisal',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
