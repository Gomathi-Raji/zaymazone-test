import React from 'react';
import { useProducts } from '@/hooks/useProducts';

const ApiDebugComponent = () => {
  const { data: productsData, isLoading, error } = useProducts({ limit: 1 });

  console.log('Products hook result:', { productsData, isLoading, error });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!productsData?.products?.length) return <div>No products found</div>;

  const product = productsData.products[0];
  console.log('First product:', product);
  console.log('Product images:', product.images);

  return (
    <div className="p-4 border">
      <h3>API Debug - First Product</h3>
      <p><strong>Name:</strong> {product.name}</p>
      <p><strong>ID:</strong> {product.id}</p>
      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>Images:</strong></p>
      <ul>
        {product.images?.map((img, index) => (
          <li key={index}>
            <a href={img} target="_blank" rel="noopener noreferrer">{img}</a>
            <br />
            <img 
              src={img} 
              alt={product.name} 
              style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ccc' }}
              onLoad={() => console.log(`Image loaded: ${img}`)}
              onError={() => console.log(`Image failed to load: ${img}`)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApiDebugComponent;