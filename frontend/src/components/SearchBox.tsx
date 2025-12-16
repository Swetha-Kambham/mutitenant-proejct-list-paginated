import { useState, useEffect } from 'react';

interface SearchBoxProps {
  onSearch: (term: string) => void;
  disabled?: boolean;
}

export function SearchBox({ onSearch, disabled = false }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={disabled}
        className="search-input"
      />
    </div>
  );
}
