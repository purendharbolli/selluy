import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';

export const CategoriesPage: React.FC = () => {
  const categories = marketplaceService.getCategories();
  const allProducts = marketplaceService.getPublicProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Shop By Aesthetic &amp; Craft
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
          All Marketplace Categories
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Explore verified independent Indian creators organized by craftsmanship and category.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const count = allProducts.filter(
            (p) => p.category?.slug === cat.slug || p.category_id === cat.id
          ).length;

          return (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.slug}`}
              className="group relative bg-white rounded-3xl overflow-hidden border border-sand-200 shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-1 transition duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-sand-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 group-hover:text-blue-600 transition">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-stone-500 mt-1 block">
                    {count} creations live right now
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Browse creations</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;
