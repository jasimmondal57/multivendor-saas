<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BankHoliday extends Model
{
    protected $fillable = [
        'holiday_date',
        'name',
        'type',
        'state',
        'description',
        'is_active',
    ];

    protected $casts = [
        'holiday_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Check if a given date is a bank holiday
     */
    public static function isHoliday(string|Carbon $date, ?string $state = null): bool
    {
        $date = $date instanceof Carbon ? $date : Carbon::parse($date);

        $query = self::where('holiday_date', $date->format('Y-m-d'))
            ->where('is_active', true);

        // Check for national holidays or state-specific holidays
        $query->where(function ($q) use ($state) {
            $q->where('type', 'national')
              ->orWhere('type', 'bank_only');

            if ($state) {
                $q->orWhere('state', $state);
            }
        });

        return $query->exists();
    }

    /**
     * Get next working day (skip weekends and bank holidays)
     */
    public static function getNextWorkingDay(string|Carbon $date, ?string $state = null): Carbon
    {
        $date = $date instanceof Carbon ? $date->copy() : Carbon::parse($date);

        do {
            $date->addDay();

            // Skip weekends (Saturday = 6, Sunday = 0)
            while ($date->dayOfWeek === Carbon::SATURDAY || $date->dayOfWeek === Carbon::SUNDAY) {
                $date->addDay();
            }

        } while (self::isHoliday($date, $state));

        return $date;
    }

    /**
     * Check if a date is a weekend
     */
    public static function isWeekend(string|Carbon $date): bool
    {
        $date = $date instanceof Carbon ? $date : Carbon::parse($date);
        return $date->dayOfWeek === Carbon::SATURDAY || $date->dayOfWeek === Carbon::SUNDAY;
    }

    /**
     * Get all holidays in a date range
     */
    public static function getHolidaysInRange(string|Carbon $startDate, string|Carbon $endDate, ?string $state = null): array
    {
        $startDate = $startDate instanceof Carbon ? $startDate->format('Y-m-d') : $startDate;
        $endDate = $endDate instanceof Carbon ? $endDate->format('Y-m-d') : $endDate;

        $query = self::whereBetween('holiday_date', [$startDate, $endDate])
            ->where('is_active', true);

        if ($state) {
            $query->where(function ($q) use ($state) {
                $q->where('type', 'national')
                  ->orWhere('type', 'bank_only')
                  ->orWhere('state', $state);
            });
        } else {
            $query->whereIn('type', ['national', 'bank_only']);
        }

        return $query->pluck('holiday_date')->map(fn($date) => $date->format('Y-m-d'))->toArray();
    }
}
