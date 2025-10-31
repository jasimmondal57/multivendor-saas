<?php

namespace Database\Seeders;

use App\Models\BankHoliday;
use Illuminate\Database\Seeder;

class BankHolidaysSeeder extends Seeder
{
    /**
     * Run the database seeder.
     *
     * Indian National Holidays and Bank Holidays for 2025-2026
     */
    public function run(): void
    {
        $holidays = [
            // 2025 Holidays
            ['holiday_date' => '2025-01-26', 'name' => 'Republic Day', 'type' => 'national', 'description' => 'Republic Day of India'],
            ['holiday_date' => '2025-03-14', 'name' => 'Holi', 'type' => 'national', 'description' => 'Festival of Colors'],
            ['holiday_date' => '2025-03-31', 'name' => 'Eid ul-Fitr', 'type' => 'national', 'description' => 'End of Ramadan'],
            ['holiday_date' => '2025-04-10', 'name' => 'Mahavir Jayanti', 'type' => 'national', 'description' => 'Birth anniversary of Lord Mahavir'],
            ['holiday_date' => '2025-04-14', 'name' => 'Ambedkar Jayanti', 'type' => 'national', 'description' => 'Birth anniversary of Dr. B.R. Ambedkar'],
            ['holiday_date' => '2025-04-18', 'name' => 'Good Friday', 'type' => 'national', 'description' => 'Crucifixion of Jesus Christ'],
            ['holiday_date' => '2025-05-01', 'name' => 'May Day', 'type' => 'national', 'description' => 'International Workers Day'],
            ['holiday_date' => '2025-06-07', 'name' => 'Eid ul-Adha', 'type' => 'national', 'description' => 'Festival of Sacrifice'],
            ['holiday_date' => '2025-08-15', 'name' => 'Independence Day', 'type' => 'national', 'description' => 'Independence Day of India'],
            ['holiday_date' => '2025-08-27', 'name' => 'Janmashtami', 'type' => 'national', 'description' => 'Birth of Lord Krishna'],
            ['holiday_date' => '2025-10-02', 'name' => 'Gandhi Jayanti', 'type' => 'national', 'description' => 'Birth anniversary of Mahatma Gandhi'],
            ['holiday_date' => '2025-10-20', 'name' => 'Dussehra', 'type' => 'national', 'description' => 'Victory of good over evil'],
            ['holiday_date' => '2025-11-05', 'name' => 'Diwali', 'type' => 'national', 'description' => 'Festival of Lights'],
            ['holiday_date' => '2025-11-06', 'name' => 'Diwali (Second Day)', 'type' => 'national', 'description' => 'Festival of Lights - Day 2'],
            ['holiday_date' => '2025-11-24', 'name' => 'Guru Nanak Jayanti', 'type' => 'national', 'description' => 'Birth anniversary of Guru Nanak'],
            ['holiday_date' => '2025-12-25', 'name' => 'Christmas', 'type' => 'national', 'description' => 'Birth of Jesus Christ'],

            // 2026 Holidays
            ['holiday_date' => '2026-01-26', 'name' => 'Republic Day', 'type' => 'national', 'description' => 'Republic Day of India'],
            ['holiday_date' => '2026-03-03', 'name' => 'Holi', 'type' => 'national', 'description' => 'Festival of Colors'],
            ['holiday_date' => '2026-03-21', 'name' => 'Eid ul-Fitr', 'type' => 'national', 'description' => 'End of Ramadan'],
            ['holiday_date' => '2026-04-02', 'name' => 'Mahavir Jayanti', 'type' => 'national', 'description' => 'Birth anniversary of Lord Mahavir'],
            ['holiday_date' => '2026-04-03', 'name' => 'Good Friday', 'type' => 'national', 'description' => 'Crucifixion of Jesus Christ'],
            ['holiday_date' => '2026-04-14', 'name' => 'Ambedkar Jayanti', 'type' => 'national', 'description' => 'Birth anniversary of Dr. B.R. Ambedkar'],
            ['holiday_date' => '2026-05-01', 'name' => 'May Day', 'type' => 'national', 'description' => 'International Workers Day'],
            ['holiday_date' => '2026-05-28', 'name' => 'Eid ul-Adha', 'type' => 'national', 'description' => 'Festival of Sacrifice'],
            ['holiday_date' => '2026-08-15', 'name' => 'Independence Day', 'type' => 'national', 'description' => 'Independence Day of India'],
            ['holiday_date' => '2026-08-16', 'name' => 'Janmashtami', 'type' => 'national', 'description' => 'Birth of Lord Krishna'],
            ['holiday_date' => '2026-10-02', 'name' => 'Gandhi Jayanti', 'type' => 'national', 'description' => 'Birth anniversary of Mahatma Gandhi'],
            ['holiday_date' => '2026-10-08', 'name' => 'Dussehra', 'type' => 'national', 'description' => 'Victory of good over evil'],
            ['holiday_date' => '2026-10-24', 'name' => 'Diwali', 'type' => 'national', 'description' => 'Festival of Lights'],
            ['holiday_date' => '2026-10-25', 'name' => 'Diwali (Second Day)', 'type' => 'national', 'description' => 'Festival of Lights - Day 2'],
            ['holiday_date' => '2026-11-13', 'name' => 'Guru Nanak Jayanti', 'type' => 'national', 'description' => 'Birth anniversary of Guru Nanak'],
            ['holiday_date' => '2026-12-25', 'name' => 'Christmas', 'type' => 'national', 'description' => 'Birth of Jesus Christ'],

            // Bank-only holidays (2nd and 4th Saturdays)
            ['holiday_date' => '2025-11-08', 'name' => '2nd Saturday', 'type' => 'bank_only', 'description' => 'Bank Holiday'],
            ['holiday_date' => '2025-11-22', 'name' => '4th Saturday', 'type' => 'bank_only', 'description' => 'Bank Holiday'],
            ['holiday_date' => '2025-12-13', 'name' => '2nd Saturday', 'type' => 'bank_only', 'description' => 'Bank Holiday'],
            ['holiday_date' => '2025-12-27', 'name' => '4th Saturday', 'type' => 'bank_only', 'description' => 'Bank Holiday'],
            ['holiday_date' => '2026-01-10', 'name' => '2nd Saturday', 'type' => 'bank_only', 'description' => 'Bank Holiday'],
            ['holiday_date' => '2026-01-24', 'name' => '4th Saturday', 'type' => 'bank_only', 'description' => 'Bank Holiday'],
        ];

        foreach ($holidays as $holiday) {
            BankHoliday::updateOrCreate(
                ['holiday_date' => $holiday['holiday_date']],
                $holiday
            );
        }

        $this->command->info('Bank holidays seeded successfully!');
    }
}
