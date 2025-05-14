const Layout = () => {
  return (
    <main className="p-8 bg-gray-50">
    
      <section className="text-center mb-16 mt-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Amazing Packages</h1>
        <p className="text-lg text-gray-600">Find the perfect tour package for your next adventure!</p>
      </section>

      
      <section className="mb-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src="https://via.placeholder.com/400" alt="Package 1" className="w-full h-64 object-cover" />
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800">Tropical Getaway</h2>
              <p className="text-gray-600 mt-2">Enjoy a relaxing vacation in beautiful tropical islands.</p>
              <a href="#book-now" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">Book Now</a>
            </div>
          </div>
          
        </div>
      </section>

      
      <section id="book-now" className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Book Your Package</h2>
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-gray-700">Name</label>
              <input type="text" id="name" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input type="email" id="email" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>


          <div className="mb-4">
            <label htmlFor="package" className="block text-gray-700">Select Package</label>
            <select id="package" className="w-full p-2 border border-gray-300 rounded-md">
              <option>Tropical Getaway</option>
              <option>Mountain Adventure</option>
              
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300">Submit</button>
        </form>
      </section>

    </main>
  );
};

export default Layout;
