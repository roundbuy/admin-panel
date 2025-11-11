import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const SearchBar = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  const [searchValue, setSearchValue] = useState(value || '');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setSearchValue('');
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  return (
    <TextField
      fullWidth
      size="small"
      value={searchValue}
      onChange={handleChange}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: searchValue && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;