export function loadProducts() {
  // Note: Image URLs use Unsplash; replace later with your own product photos.
  return [
    {
      id: 'velvet-rose',
      name: 'Velvet Rose',
      brand: 'Shady Market',
      category: 'Floral',
      notes: ['Rose absolute', 'Pear', 'Vanilla musk'],
      price: 59,
      compareAt: 79,
      image:
        'https://images.unsplash.com/photo-1600180758895-7f9d9f44d2a4?auto=format&fit=crop&w=1200&q=80',
      badge: 'Bestseller'
    },
    {
      id: 'amber-night',
      name: 'Amber Night',
      brand: 'Shady Market',
      category: 'Woody',
      notes: ['Amber resin', 'Cedarwood', 'Saffron'],
      price: 64,
      compareAt: 74,
      image:
        'https://images.unsplash.com/photo-1608133894574-2e9b02e1c2ad?auto=format&fit=crop&w=1200&q=80',
      badge: 'New'
    },
    {
      id: 'citrus-silk',
      name: 'Citrus Silk',
      brand: 'Shady Market',
      category: 'Fresh',
      notes: ['Bergamot', 'Lemon zest', 'Soft musk'],
      price: 52,
      compareAt: null,
      image:
        'https://images.unsplash.com/photo-1611930022073-b59e21f30c10?auto=format&fit=crop&w=1200&q=80',
      badge: 'Fresh'
    },
    {
      id: 'midnight-linen',
      name: 'Midnight Linen',
      brand: 'Shady Market',
      category: 'Clean',
      notes: ['White tea', 'Cashmere', 'Mineral air'],
      price: 58,
      compareAt: 68,
      image:
        'https://images.unsplash.com/photo-1585386959984-a41552d3dc58?auto=format&fit=crop&w=1200&q=80',
      badge: 'Signature'
    },
    {
      id: 'smoke-elegance',
      name: 'Smoke Elegance',
      brand: 'Shady Market',
      category: 'Gourmand',
      notes: ['Smoked vanilla', 'Tonka bean', 'Rum accord'],
      price: 72,
      compareAt: null,
      image:
        'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1200&q=80',
      badge: 'Limited'
    },
    {
      id: 'blush-orchid',
      name: 'Blush Orchid',
      brand: 'Shady Market',
      category: 'Floral',
      notes: ['Orchid bloom', 'Lychee', 'Powdered iris'],
      price: 61,
      compareAt: 81,
      image:
        'https://images.unsplash.com/photo-1521401830884-5f1a1c1f4e5b?auto=format&fit=crop&w=1200&q=80',
      badge: 'Featured'
    }
  ];
}

