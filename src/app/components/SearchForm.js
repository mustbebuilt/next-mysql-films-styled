"use client";
import { useState } from "react";
import Link from "next/link";

const SearchForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") return;

    try {
      setError(null); // reset error before each search
      const response = await fetch(
        `/catalogue/api?q=${encodeURIComponent(searchTerm)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const results = await response.json();

      // If API always returns { films: [...] }
      setSearchResults(results.films || []);
    } catch (err) {
      console.error("Search Error:", err);
      setError("Something went wrong fetching results.");
      setSearchResults([]); // clear old results
    } finally {
      setSearched(true); // ✅ ensures "no results" shows if list is empty
    }
  };

  return (
    <div>
      <div className='searchForm'>
        <form onSubmit={handleSearch}>
          <div>
            <label htmlFor='q'>Search:</label>
            <input
              type='text'
              name='q'
              id='q'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <input type='submit' value='Search for a Film' />
          </div>
        </form>
      </div>

      <div>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {searchResults.length > 0 ? (
          <div>
            <h3>Search Results (Found {searchResults.length}):</h3>
            {searchResults.map((film) => (
              <div key={film.film_id}>
                <p>
                  <Link href={`/catalogue/${film.film_id}`}>
                    {film.film_title} ({film.film_certificate})
                  </Link>
                </p>
              </div>
            ))}
          </div>
        ) : (
          searched && !error && <p>No films found</p>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
