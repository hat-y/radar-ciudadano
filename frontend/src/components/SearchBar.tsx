import React, { useState } from 'react'
import { Autocomplete } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

interface SearchBarProps {
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: string | number
  onSearch?: (value: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar artículos, autores, temas...',
  size = 'md',
  radius = 'xs',
  onSearch,
}) => {
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = () => {
    if (onSearch && searchValue.trim()) {
      onSearch(searchValue)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Autocomplete
      placeholder={placeholder}
      leftSection={<IconSearch size={16} stroke={1.5} />}
      size={size}
      radius={radius}
      flex={1}
      value={searchValue}
      onChange={setSearchValue}
      onKeyDown={handleKeyPress}
      styles={{
        label: {
          color: 'var(--mantine-color-white)',
          fontWeight: 500,
        },
      }}
    />
  )
}
