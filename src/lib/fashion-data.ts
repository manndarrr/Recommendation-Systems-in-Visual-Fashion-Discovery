export interface FashionItem {
  id?: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  color_tags: string[];
  pattern_tags: string[];
  style_tags: string[];
  price: number;
  brand: string;
  gender: string;
  complementary_categories: string[];
}

export const FASHION_CATALOG: FashionItem[] = [
  // TOPS
  { name: "Silk Ivory Blouse", description: "Elegant silk blouse with a relaxed fit and subtle sheen", image_url: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600", category: "tops", color_tags: ["white", "ivory"], pattern_tags: ["solid"], style_tags: ["minimalist", "classic", "elegant"], price: 129.00, brand: "Maison Claire", gender: "women", complementary_categories: ["bottoms", "accessories", "shoes"] },
  { name: "Charcoal Cashmere Sweater", description: "Ultra-soft cashmere crew neck in deep charcoal", image_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600", category: "tops", color_tags: ["charcoal", "grey"], pattern_tags: ["solid"], style_tags: ["minimalist", "classic", "cozy"], price: 245.00, brand: "Atelier Noir", gender: "unisex", complementary_categories: ["bottoms", "outerwear", "accessories"] },
  { name: "Terracotta Linen Shirt", description: "Breathable linen shirt in warm terracotta", image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600", category: "tops", color_tags: ["terracotta", "orange", "warm"], pattern_tags: ["solid"], style_tags: ["bohemian", "casual", "earthy"], price: 89.00, brand: "Sol & Terra", gender: "unisex", complementary_categories: ["bottoms", "accessories", "shoes"] },
  { name: "Navy Striped Tee", description: "Classic Breton stripe tee in navy and white", image_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600", category: "tops", color_tags: ["navy", "white", "blue"], pattern_tags: ["striped"], style_tags: ["classic", "casual", "nautical"], price: 55.00, brand: "Côte Maritime", gender: "unisex", complementary_categories: ["bottoms", "shoes", "outerwear"] },
  { name: "Emerald Satin Camisole", description: "Luxurious satin camisole with delicate straps", image_url: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600", category: "tops", color_tags: ["emerald", "green"], pattern_tags: ["solid"], style_tags: ["elegant", "evening", "luxe"], price: 115.00, brand: "Velvet & Co", gender: "women", complementary_categories: ["bottoms", "accessories", "shoes"] },
  { name: "Oversized Graphic Tee", description: "Urban oversized tee with abstract art print", image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600", category: "tops", color_tags: ["black", "multi"], pattern_tags: ["graphic", "abstract"], style_tags: ["streetwear", "urban", "bold"], price: 65.00, brand: "STRTKLT", gender: "unisex", complementary_categories: ["bottoms", "shoes", "accessories"] },
  { name: "Blush Pink Wrap Top", description: "Feminine wrap top in dusty rose", image_url: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600", category: "tops", color_tags: ["pink", "blush", "rose"], pattern_tags: ["solid"], style_tags: ["romantic", "feminine", "elegant"], price: 95.00, brand: "Pétale", gender: "women", complementary_categories: ["bottoms", "accessories", "shoes"] },
  { name: "Denim Chambray Shirt", description: "Washed chambray shirt with pearl snap buttons", image_url: "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600", category: "tops", color_tags: ["blue", "denim", "indigo"], pattern_tags: ["solid"], style_tags: ["casual", "western", "classic"], price: 78.00, brand: "Frontier Co.", gender: "unisex", complementary_categories: ["bottoms", "outerwear", "shoes"] },

  // BOTTOMS
  { name: "Tailored Black Trousers", description: "High-waisted tailored trousers with clean lines", image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600", category: "bottoms", color_tags: ["black"], pattern_tags: ["solid"], style_tags: ["minimalist", "classic", "professional"], price: 165.00, brand: "Maison Claire", gender: "women", complementary_categories: ["tops", "shoes", "accessories"] },
  { name: "Vintage Wash Jeans", description: "Mid-rise straight leg jeans in vintage wash", image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600", category: "bottoms", color_tags: ["blue", "denim"], pattern_tags: ["solid"], style_tags: ["casual", "classic", "vintage"], price: 120.00, brand: "Heritage Denim", gender: "unisex", complementary_categories: ["tops", "shoes", "outerwear"] },
  { name: "Olive Cargo Pants", description: "Relaxed fit cargo pants in olive green", image_url: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600", category: "bottoms", color_tags: ["olive", "green", "khaki"], pattern_tags: ["solid"], style_tags: ["streetwear", "casual", "utilitarian"], price: 95.00, brand: "STRTKLT", gender: "unisex", complementary_categories: ["tops", "shoes", "accessories"] },
  { name: "Cream Pleated Skirt", description: "Midi pleated skirt in soft cream", image_url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600", category: "bottoms", color_tags: ["cream", "ivory", "white"], pattern_tags: ["solid", "pleated"], style_tags: ["elegant", "classic", "feminine"], price: 135.00, brand: "Pétale", gender: "women", complementary_categories: ["tops", "shoes", "accessories"] },
  { name: "Wide Leg Linen Pants", description: "Flowy wide-leg linen pants in sand", image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600", category: "bottoms", color_tags: ["sand", "beige", "neutral"], pattern_tags: ["solid"], style_tags: ["bohemian", "casual", "relaxed"], price: 110.00, brand: "Sol & Terra", gender: "women", complementary_categories: ["tops", "shoes", "accessories"] },
  { name: "Burgundy Velvet Trousers", description: "Statement velvet trousers in deep burgundy", image_url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600", category: "bottoms", color_tags: ["burgundy", "red", "wine"], pattern_tags: ["solid", "velvet"], style_tags: ["elegant", "evening", "bold"], price: 175.00, brand: "Velvet & Co", gender: "women", complementary_categories: ["tops", "shoes", "accessories"] },
  { name: "Plaid Wool Trousers", description: "Tailored plaid trousers in grey and camel", image_url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600", category: "bottoms", color_tags: ["grey", "camel", "brown"], pattern_tags: ["plaid", "check"], style_tags: ["classic", "preppy", "professional"], price: 155.00, brand: "Thornbury", gender: "unisex", complementary_categories: ["tops", "shoes", "outerwear"] },
  { name: "Black Leather Pants", description: "Sleek leather-look pants with a slim fit", image_url: "https://images.unsplash.com/photo-1551854838-212c50b4c184?w=600", category: "bottoms", color_tags: ["black"], pattern_tags: ["solid", "leather"], style_tags: ["edgy", "evening", "urban"], price: 195.00, brand: "Atelier Noir", gender: "unisex", complementary_categories: ["tops", "shoes", "accessories"] },

  // SHOES
  { name: "White Leather Sneakers", description: "Clean minimal leather sneakers", image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600", category: "shoes", color_tags: ["white"], pattern_tags: ["solid"], style_tags: ["minimalist", "casual", "classic"], price: 165.00, brand: "Common Projects", gender: "unisex", complementary_categories: ["tops", "bottoms"] },
  { name: "Black Pointed Heels", description: "Classic pointed-toe heels in glossy black", image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600", category: "shoes", color_tags: ["black"], pattern_tags: ["solid"], style_tags: ["elegant", "classic", "evening"], price: 225.00, brand: "Maison Claire", gender: "women", complementary_categories: ["bottoms", "dresses"] },
  { name: "Tan Chelsea Boots", description: "Suede Chelsea boots in warm tan", image_url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600", category: "shoes", color_tags: ["tan", "brown", "camel"], pattern_tags: ["solid"], style_tags: ["classic", "casual", "bohemian"], price: 195.00, brand: "Thornbury", gender: "unisex", complementary_categories: ["bottoms", "outerwear"] },
  { name: "Gold Strappy Sandals", description: "Delicate gold strappy sandals for evening", image_url: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600", category: "shoes", color_tags: ["gold", "metallic"], pattern_tags: ["solid"], style_tags: ["elegant", "evening", "luxe"], price: 175.00, brand: "Velvet & Co", gender: "women", complementary_categories: ["dresses", "bottoms"] },
  { name: "Chunky Platform Sneakers", description: "Bold platform sneakers in black and white", image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600", category: "shoes", color_tags: ["black", "white"], pattern_tags: ["solid"], style_tags: ["streetwear", "bold", "urban"], price: 145.00, brand: "STRTKLT", gender: "unisex", complementary_categories: ["bottoms", "tops"] },
  { name: "Burgundy Loafers", description: "Polished leather penny loafers in burgundy", image_url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600", category: "shoes", color_tags: ["burgundy", "red", "wine"], pattern_tags: ["solid"], style_tags: ["classic", "preppy", "professional"], price: 210.00, brand: "Thornbury", gender: "unisex", complementary_categories: ["bottoms", "tops"] },
  { name: "Nude Ballet Flats", description: "Soft leather ballet flats in nude", image_url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600", category: "shoes", color_tags: ["nude", "beige", "neutral"], pattern_tags: ["solid"], style_tags: ["classic", "minimalist", "feminine"], price: 135.00, brand: "Pétale", gender: "women", complementary_categories: ["bottoms", "dresses"] },
  { name: "Black Combat Boots", description: "Rugged combat boots with chunky sole", image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600", category: "shoes", color_tags: ["black"], pattern_tags: ["solid"], style_tags: ["edgy", "streetwear", "urban"], price: 185.00, brand: "Atelier Noir", gender: "unisex", complementary_categories: ["bottoms", "outerwear"] },

  // ACCESSORIES
  { name: "Gold Chain Necklace", description: "Delicate gold chain necklace, layering piece", image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600", category: "accessories", color_tags: ["gold", "metallic"], pattern_tags: ["solid"], style_tags: ["elegant", "minimalist", "luxe"], price: 85.00, brand: "Velvet & Co", gender: "women", complementary_categories: ["tops", "dresses"] },
  { name: "Leather Crossbody Bag", description: "Compact leather crossbody in cognac", image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600", category: "accessories", color_tags: ["brown", "cognac", "tan"], pattern_tags: ["solid"], style_tags: ["classic", "casual", "bohemian"], price: 195.00, brand: "Thornbury", gender: "unisex", complementary_categories: ["tops", "bottoms", "shoes"] },
  { name: "Silk Patterned Scarf", description: "Vibrant silk scarf with botanical print", image_url: "https://images.unsplash.com/photo-1601379329542-31c59347e2b8?w=600", category: "accessories", color_tags: ["multi", "green", "pink"], pattern_tags: ["floral", "botanical"], style_tags: ["bohemian", "elegant", "artsy"], price: 120.00, brand: "Sol & Terra", gender: "women", complementary_categories: ["tops", "outerwear"] },
  { name: "Oversized Sunglasses", description: "Retro oversized sunglasses in tortoiseshell", image_url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600", category: "accessories", color_tags: ["brown", "tortoise"], pattern_tags: ["tortoiseshell"], style_tags: ["classic", "retro", "luxe"], price: 165.00, brand: "Maison Claire", gender: "unisex", complementary_categories: ["tops", "outerwear"] },
  { name: "Statement Pearl Earrings", description: "Baroque pearl drop earrings", image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600", category: "accessories", color_tags: ["white", "pearl", "cream"], pattern_tags: ["solid"], style_tags: ["elegant", "classic", "romantic"], price: 95.00, brand: "Pétale", gender: "women", complementary_categories: ["tops", "dresses"] },
  { name: "Canvas Tote Bag", description: "Minimalist canvas tote in natural", image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600", category: "accessories", color_tags: ["beige", "natural", "cream"], pattern_tags: ["solid"], style_tags: ["minimalist", "casual", "eco"], price: 45.00, brand: "Sol & Terra", gender: "unisex", complementary_categories: ["tops", "bottoms"] },
  { name: "Black Leather Belt", description: "Classic leather belt with silver buckle", image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", category: "accessories", color_tags: ["black", "silver"], pattern_tags: ["solid"], style_tags: ["classic", "minimalist", "professional"], price: 75.00, brand: "Atelier Noir", gender: "unisex", complementary_categories: ["bottoms", "tops"] },
  { name: "Woven Straw Hat", description: "Wide-brim straw hat for summer", image_url: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600", category: "accessories", color_tags: ["natural", "beige", "straw"], pattern_tags: ["woven"], style_tags: ["bohemian", "casual", "summer"], price: 65.00, brand: "Sol & Terra", gender: "women", complementary_categories: ["tops", "dresses"] },

  // OUTERWEAR
  { name: "Camel Wool Coat", description: "Timeless double-breasted wool coat in camel", image_url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600", category: "outerwear", color_tags: ["camel", "tan", "brown"], pattern_tags: ["solid"], style_tags: ["classic", "elegant", "professional"], price: 395.00, brand: "Maison Claire", gender: "women", complementary_categories: ["tops", "bottoms", "shoes"] },
  { name: "Black Leather Jacket", description: "Moto-style leather jacket in black", image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600", category: "outerwear", color_tags: ["black"], pattern_tags: ["solid"], style_tags: ["edgy", "urban", "classic"], price: 350.00, brand: "Atelier Noir", gender: "unisex", complementary_categories: ["tops", "bottoms", "shoes"] },
  { name: "Sage Green Trench", description: "Modern trench coat in muted sage", image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600", category: "outerwear", color_tags: ["sage", "green"], pattern_tags: ["solid"], style_tags: ["classic", "elegant", "modern"], price: 285.00, brand: "Thornbury", gender: "women", complementary_categories: ["tops", "bottoms", "shoes"] },
  { name: "Puffer Vest", description: "Lightweight puffer vest in navy", image_url: "https://images.unsplash.com/photo-1544923246-77307dd270b3?w=600", category: "outerwear", color_tags: ["navy", "blue"], pattern_tags: ["solid", "quilted"], style_tags: ["casual", "sporty", "classic"], price: 145.00, brand: "Frontier Co.", gender: "unisex", complementary_categories: ["tops", "bottoms"] },
  { name: "Oversized Blazer", description: "Relaxed-fit blazer in heather grey", image_url: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600", category: "outerwear", color_tags: ["grey", "heather"], pattern_tags: ["solid"], style_tags: ["professional", "minimalist", "modern"], price: 225.00, brand: "Maison Claire", gender: "women", complementary_categories: ["tops", "bottoms", "shoes"] },
  { name: "Quilted Bomber Jacket", description: "Quilted bomber jacket in olive", image_url: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600", category: "outerwear", color_tags: ["olive", "green"], pattern_tags: ["quilted"], style_tags: ["streetwear", "casual", "urban"], price: 175.00, brand: "STRTKLT", gender: "unisex", complementary_categories: ["tops", "bottoms", "shoes"] },

  // DRESSES
  { name: "Black Slip Dress", description: "Minimalist silk slip dress in black", image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600", category: "dresses", color_tags: ["black"], pattern_tags: ["solid"], style_tags: ["minimalist", "elegant", "evening"], price: 225.00, brand: "Atelier Noir", gender: "women", complementary_categories: ["shoes", "accessories"] },
  { name: "Floral Midi Dress", description: "Romantic floral print midi dress in pastels", image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600", category: "dresses", color_tags: ["pink", "multi", "pastel"], pattern_tags: ["floral"], style_tags: ["romantic", "bohemian", "feminine"], price: 185.00, brand: "Pétale", gender: "women", complementary_categories: ["shoes", "accessories"] },
  { name: "Rust Wrap Dress", description: "Flowing wrap dress in warm rust", image_url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600", category: "dresses", color_tags: ["rust", "orange", "warm"], pattern_tags: ["solid"], style_tags: ["bohemian", "casual", "earthy"], price: 155.00, brand: "Sol & Terra", gender: "women", complementary_categories: ["shoes", "accessories"] },
  { name: "White Linen Dress", description: "Airy linen shirt dress in white", image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600", category: "dresses", color_tags: ["white", "ivory"], pattern_tags: ["solid"], style_tags: ["minimalist", "casual", "summer"], price: 145.00, brand: "Sol & Terra", gender: "women", complementary_categories: ["shoes", "accessories"] },
  { name: "Emerald Evening Gown", description: "Floor-length gown in deep emerald satin", image_url: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600", category: "dresses", color_tags: ["emerald", "green"], pattern_tags: ["solid"], style_tags: ["elegant", "evening", "luxe"], price: 425.00, brand: "Velvet & Co", gender: "women", complementary_categories: ["shoes", "accessories"] },
  { name: "Striped Shirt Dress", description: "Classic striped shirt dress in blue and white", image_url: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600", category: "dresses", color_tags: ["blue", "white"], pattern_tags: ["striped"], style_tags: ["classic", "casual", "nautical"], price: 135.00, brand: "Côte Maritime", gender: "women", complementary_categories: ["shoes", "accessories"] },
];

export const STYLE_CATEGORIES = [
  "formal", "casual", "classic", "leather", "sporty",
  "luxury", "vintage", "streetwear", "minimal", "elegant",
];

export const COLOR_PALETTE = [
  { name: "Black", value: "black" },
  { name: "White", value: "white" },
  { name: "Navy", value: "navy" },
  { name: "Beige", value: "beige" },
  { name: "Burgundy", value: "burgundy" },
  { name: "Emerald", value: "emerald" },
  { name: "Terracotta", value: "terracotta" },
  { name: "Pink", value: "pink" },
  { name: "Camel", value: "camel" },
  { name: "Grey", value: "grey" },
  { name: "Olive", value: "olive" },
  { name: "Gold", value: "gold" },
];

export const PATTERN_OPTIONS = [
  "solid", "striped", "floral", "plaid", "graphic", "abstract", "botanical"
];
