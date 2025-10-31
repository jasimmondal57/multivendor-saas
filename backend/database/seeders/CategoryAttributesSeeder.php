<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\CategoryAttribute;
use Illuminate\Support\Str;

class CategoryAttributesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🎨 Seeding Category Attributes...');

        // Get categories
        $electronics = Category::where('slug', 'electronics')->first();
        $fashion = Category::where('slug', 'fashion')->first();
        $homeKitchen = Category::where('slug', 'home-kitchen')->first();

        // Electronics Attributes
        if ($electronics) {
            $this->command->info('  📱 Adding Electronics attributes...');
            $this->createAttributes($electronics->id, [
                [
                    'name' => 'Brand',
                    'slug' => 'brand',
                    'input_type' => 'select',
                    'options' => ['Samsung', 'Apple', 'Sony', 'LG', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo', 'Motorola', 'Nokia', 'Asus', 'HP', 'Dell', 'Lenovo', 'Acer', 'Other'],
                    'is_required' => true,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 1,
                    'help_text' => 'Select the brand of the product',
                ],
                [
                    'name' => 'Model Number',
                    'slug' => 'model_number',
                    'input_type' => 'text',
                    'options' => null,
                    'is_required' => false,
                    'is_filterable' => false,
                    'is_variant' => false,
                    'sort_order' => 2,
                    'help_text' => 'Enter the model number',
                ],
                [
                    'name' => 'Warranty Period',
                    'slug' => 'warranty_period',
                    'input_type' => 'select',
                    'options' => ['No Warranty', '6 Months', '1 Year', '2 Years', '3 Years', '5 Years'],
                    'is_required' => true,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 3,
                    'help_text' => 'Select warranty period',
                ],
                [
                    'name' => 'Color',
                    'slug' => 'color',
                    'input_type' => 'multi_select',
                    'options' => ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red', 'Green', 'Pink', 'Purple', 'Gray', 'Rose Gold', 'Space Gray'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => true,
                    'sort_order' => 4,
                    'help_text' => 'Select available colors',
                ],
                [
                    'name' => 'Storage Capacity',
                    'slug' => 'storage_capacity',
                    'input_type' => 'multi_select',
                    'options' => ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => true,
                    'sort_order' => 5,
                    'help_text' => 'Select available storage options',
                ],
                [
                    'name' => 'RAM',
                    'slug' => 'ram',
                    'input_type' => 'multi_select',
                    'options' => ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => true,
                    'sort_order' => 6,
                    'help_text' => 'Select available RAM options',
                ],
                [
                    'name' => 'Screen Size',
                    'slug' => 'screen_size',
                    'input_type' => 'select',
                    'options' => ['5 inch', '5.5 inch', '6 inch', '6.5 inch', '7 inch', '10 inch', '13 inch', '15 inch', '17 inch', '24 inch', '27 inch', '32 inch', '43 inch', '50 inch', '55 inch', '65 inch', '75 inch'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 7,
                    'help_text' => 'Select screen size',
                ],
                [
                    'name' => 'Battery Capacity',
                    'slug' => 'battery_capacity',
                    'input_type' => 'text',
                    'options' => null,
                    'is_required' => false,
                    'is_filterable' => false,
                    'is_variant' => false,
                    'sort_order' => 8,
                    'help_text' => 'Enter battery capacity (e.g., 5000mAh)',
                ],
                [
                    'name' => 'Processor',
                    'slug' => 'processor',
                    'input_type' => 'text',
                    'options' => null,
                    'is_required' => false,
                    'is_filterable' => false,
                    'is_variant' => false,
                    'sort_order' => 9,
                    'help_text' => 'Enter processor details',
                ],
                [
                    'name' => 'Operating System',
                    'slug' => 'operating_system',
                    'input_type' => 'select',
                    'options' => ['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Other'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 10,
                    'help_text' => 'Select operating system',
                ],
            ]);
        }

        // Fashion Attributes (for Indian Ethnic Wear)
        if ($fashion) {
            $this->command->info('  👗 Adding Fashion attributes...');
            $this->createAttributes($fashion->id, [
                [
                    'name' => 'Product Type',
                    'slug' => 'product_type',
                    'input_type' => 'select',
                    'options' => ['Saree', 'Kurti', 'Kurta', 'Lehenga', 'Salwar Kameez', 'Palazzo Set', 'Anarkali', 'Gown', 'Dupatta', 'Blouse', 'Shirt', 'T-Shirt', 'Jeans', 'Trousers', 'Dress', 'Skirt', 'Top', 'Jacket', 'Coat', 'Sweater', 'Shawl', 'Stole', 'Scarf'],
                    'is_required' => true,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 1,
                    'help_text' => 'Select the type of clothing',
                ],
                [
                    'name' => 'Size',
                    'slug' => 'size',
                    'input_type' => 'multi_select',
                    'options' => ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => true,
                    'sort_order' => 2,
                    'help_text' => 'Select available sizes (Note: Sarees typically don\'t need size)',
                ],
                [
                    'name' => 'Color',
                    'slug' => 'color',
                    'input_type' => 'multi_select',
                    'options' => ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Black', 'White', 'Gray', 'Brown', 'Beige', 'Maroon', 'Navy Blue', 'Sky Blue', 'Teal', 'Turquoise', 'Magenta', 'Gold', 'Silver', 'Multi Color'],
                    'is_required' => true,
                    'is_filterable' => true,
                    'is_variant' => true,
                    'sort_order' => 3,
                    'help_text' => 'Select available colors',
                ],
                [
                    'name' => 'Fabric',
                    'slug' => 'fabric',
                    'input_type' => 'select',
                    'options' => ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Crepe', 'Satin', 'Velvet', 'Net', 'Organza', 'Chanderi', 'Banarasi Silk', 'Kanjivaram Silk', 'Tussar Silk', 'Art Silk', 'Rayon', 'Polyester', 'Linen', 'Denim', 'Khadi', 'Lycra', 'Jersey', 'Wool', 'Pashmina', 'Viscose', 'Modal'],
                    'is_required' => true,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 4,
                    'help_text' => 'Select the fabric material',
                ],
                [
                    'name' => 'Pattern',
                    'slug' => 'pattern',
                    'input_type' => 'select',
                    'options' => ['Solid', 'Printed', 'Embroidered', 'Woven', 'Striped', 'Checked', 'Floral', 'Geometric', 'Abstract', 'Paisley', 'Polka Dots', 'Animal Print', 'Self Design', 'Zari Work', 'Block Print', 'Bandhani', 'Tie & Dye', 'Ombre'],
                    'is_required' => true,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 5,
                    'help_text' => 'Select the pattern type',
                ],
                [
                    'name' => 'Occasion',
                    'slug' => 'occasion',
                    'input_type' => 'multi_select',
                    'options' => ['Casual', 'Formal', 'Party Wear', 'Wedding', 'Festive', 'Office Wear', 'Daily Wear', 'Ethnic Wear', 'Traditional', 'Ceremony', 'Bridal', 'Sangeet', 'Mehendi', 'Haldi', 'Reception', 'Engagement', 'Navratri', 'Diwali', 'Eid', 'Puja'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 6,
                    'help_text' => 'Select suitable occasions',
                ],
                [
                    'name' => 'Work Type',
                    'slug' => 'work_type',
                    'input_type' => 'multi_select',
                    'options' => ['Plain', 'Embroidery', 'Zari Work', 'Sequin Work', 'Mirror Work', 'Stone Work', 'Thread Work', 'Gota Patti', 'Resham Work', 'Kundan Work', 'Pearl Work', 'Beadwork', 'Applique', 'Patch Work', 'Hand Painted', 'Digital Print', 'Screen Print', 'Block Print'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 7,
                    'help_text' => 'Select work/embellishment types',
                ],
                [
                    'name' => 'Sleeve Type',
                    'slug' => 'sleeve_type',
                    'input_type' => 'select',
                    'options' => ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve', 'Cap Sleeve', 'Bell Sleeve', 'Puff Sleeve', 'Cold Shoulder', 'Off Shoulder'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 8,
                    'help_text' => 'Select sleeve type (for tops, kurtis, blouses)',
                ],
                [
                    'name' => 'Neck Type',
                    'slug' => 'neck_type',
                    'input_type' => 'select',
                    'options' => ['Round Neck', 'V-Neck', 'Boat Neck', 'Square Neck', 'Sweetheart Neck', 'Collar Neck', 'Mandarin Collar', 'High Neck', 'Halter Neck', 'Off Shoulder', 'Keyhole Neck', 'Chinese Collar'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 9,
                    'help_text' => 'Select neck type (for tops, kurtis, blouses)',
                ],
                [
                    'name' => 'Length',
                    'slug' => 'length',
                    'input_type' => 'select',
                    'options' => ['Short', 'Knee Length', 'Calf Length', 'Ankle Length', 'Floor Length', 'Maxi', 'Mini', 'Midi'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 10,
                    'help_text' => 'Select garment length',
                ],
                [
                    'name' => 'Fit Type',
                    'slug' => 'fit_type',
                    'input_type' => 'select',
                    'options' => ['Regular Fit', 'Slim Fit', 'Loose Fit', 'Relaxed Fit', 'Skinny Fit', 'Straight Fit', 'A-Line', 'Flared', 'Bodycon'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 11,
                    'help_text' => 'Select fit type',
                ],
                [
                    'name' => 'Saree Length',
                    'slug' => 'saree_length',
                    'input_type' => 'select',
                    'options' => ['5.5 Meters', '6 Meters', '6.3 Meters', '9 Meters'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 12,
                    'help_text' => 'Select saree length (only for sarees)',
                ],
                [
                    'name' => 'Blouse Included',
                    'slug' => 'blouse_included',
                    'input_type' => 'select',
                    'options' => ['Yes', 'No', 'Unstitched Blouse Piece'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 13,
                    'help_text' => 'Is blouse included with saree?',
                ],
                [
                    'name' => 'Border Type',
                    'slug' => 'border_type',
                    'input_type' => 'select',
                    'options' => ['Plain Border', 'Zari Border', 'Embroidered Border', 'Lace Border', 'Contrast Border', 'No Border'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 14,
                    'help_text' => 'Select border type (for sarees, dupattas)',
                ],
            ]);
        }

        // Home & Kitchen Attributes
        if ($homeKitchen) {
            $this->command->info('  🏠 Adding Home & Kitchen attributes...');
            $this->createAttributes($homeKitchen->id, [
                [
                    'name' => 'Product Type',
                    'slug' => 'product_type',
                    'input_type' => 'select',
                    'options' => ['Cookware', 'Tableware', 'Kitchen Appliance', 'Storage Container', 'Cutlery', 'Bakeware', 'Kitchen Tools', 'Dinnerware', 'Glassware', 'Serveware', 'Kitchen Linen', 'Home Decor', 'Furniture', 'Bedding', 'Bath Linen', 'Lighting'],
                    'is_required' => true,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 1,
                    'help_text' => 'Select the product type',
                ],
                [
                    'name' => 'Material',
                    'slug' => 'material',
                    'input_type' => 'multi_select',
                    'options' => ['Stainless Steel', 'Aluminum', 'Non-Stick', 'Cast Iron', 'Copper', 'Brass', 'Glass', 'Ceramic', 'Plastic', 'Silicone', 'Wood', 'Bamboo', 'Melamine', 'Porcelain', 'Bone China', 'Earthenware', 'Stone', 'Marble', 'Granite'],
                    'is_required' => true,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 2,
                    'help_text' => 'Select material(s)',
                ],
                [
                    'name' => 'Color',
                    'slug' => 'color',
                    'input_type' => 'multi_select',
                    'options' => ['Silver', 'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Brown', 'Gray', 'Gold', 'Copper', 'Multi Color', 'Transparent'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => true,
                    'sort_order' => 3,
                    'help_text' => 'Select available colors',
                ],
                [
                    'name' => 'Capacity',
                    'slug' => 'capacity',
                    'input_type' => 'select',
                    'options' => ['100ml', '250ml', '500ml', '750ml', '1 Liter', '1.5 Liters', '2 Liters', '3 Liters', '5 Liters', '10 Liters', '15 Liters', '20 Liters'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => true,
                    'sort_order' => 4,
                    'help_text' => 'Select capacity (for containers, cookware)',
                ],
                [
                    'name' => 'Size',
                    'slug' => 'size',
                    'input_type' => 'multi_select',
                    'options' => ['Small', 'Medium', 'Large', 'Extra Large', 'Set of 2', 'Set of 3', 'Set of 4', 'Set of 6', 'Set of 12'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => true,
                    'sort_order' => 5,
                    'help_text' => 'Select size or set quantity',
                ],
                [
                    'name' => 'Brand',
                    'slug' => 'brand',
                    'input_type' => 'select',
                    'options' => ['Prestige', 'Hawkins', 'Pigeon', 'Butterfly', 'Milton', 'Cello', 'Borosil', 'Wonderchef', 'Philips', 'Bajaj', 'Havells', 'Usha', 'Panasonic', 'LG', 'Samsung', 'Whirlpool', 'IFB', 'Other'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 6,
                    'help_text' => 'Select brand',
                ],
                [
                    'name' => 'Power Consumption',
                    'slug' => 'power_consumption',
                    'input_type' => 'text',
                    'options' => null,
                    'is_required' => false,
                    'is_filterable' => false,
                    'is_variant' => false,
                    'sort_order' => 7,
                    'help_text' => 'Enter power consumption (e.g., 1000W) - for appliances',
                ],
                [
                    'name' => 'Warranty Period',
                    'slug' => 'warranty_period',
                    'input_type' => 'select',
                    'options' => ['No Warranty', '6 Months', '1 Year', '2 Years', '3 Years', '5 Years', '10 Years', 'Lifetime'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 8,
                    'help_text' => 'Select warranty period',
                ],
                [
                    'name' => 'Dishwasher Safe',
                    'slug' => 'dishwasher_safe',
                    'input_type' => 'select',
                    'options' => ['Yes', 'No'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 9,
                    'help_text' => 'Is the product dishwasher safe?',
                ],
                [
                    'name' => 'Microwave Safe',
                    'slug' => 'microwave_safe',
                    'input_type' => 'select',
                    'options' => ['Yes', 'No'],
                    'is_required' => false,
                    'is_filterable' => true,
                    'is_variant' => false,
                    'sort_order' => 10,
                    'help_text' => 'Is the product microwave safe?',
                ],
            ]);
        }

        $this->command->info('✅ Category attributes seeded successfully!');
    }

    private function createAttributes($categoryId, $attributes)
    {
        foreach ($attributes as $attr) {
            CategoryAttribute::create(array_merge($attr, ['category_id' => $categoryId]));
        }
    }
}
