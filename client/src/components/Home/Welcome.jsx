import React from 'react';

const Welcome = () => {
  return (
    <div className="bg-gray-800 py-20">
      <div className="container mx-auto text-center text-gray-200">
        <h1 className="text-3xl font-semibold mb-4">Hoşgeldiniz</h1>
        <p className="text-lg max-w-3xl mx-auto">
          Bu web uygulamasını kullanarak projeleriniz için takımlar oluşturabilir veya
          yeteneklerinizi kullanmak ve geliştirmek için bir proje ekibine dahil olabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
