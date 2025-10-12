import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  isMultiSelect = true,
  isClearable = true,
  className = "",
  disabled = false,
  showSelectAll = true, // New prop to control select all feature
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if all options are selected
  const allSelected = options.length > 0 && value.length === options.length;
  
  // Check if some options are selected (for indeterminate state)
  const someSelected = value.length > 0 && value.length < options.length;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle option selection
  const handleSelect = (option) => {
    if (disabled) return;

    if (isMultiSelect) {
      const isSelected = value.some(val => val.value === option.value);
      if (isSelected) {
        // Remove if already selected
        onChange(value.filter(val => val.value !== option.value));
      } else {
        // Add if not selected
        onChange([...value, option]);
      }
    } else {
      // Single select
      onChange([option]);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  // Handle Select All
  const handleSelectAll = () => {
    if (disabled) return;
    onChange([...options]);
  };

  // Handle Deselect All
  const handleDeselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  // Toggle Select All
  const handleToggleSelectAll = () => {
    if (disabled) return;
    if (allSelected) {
      handleDeselectAll();
    } else {
      handleSelectAll();
    }
  };

  // Remove selected option
  const handleRemove = (optionValue, e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(value.filter(val => val.value !== optionValue));
  };

  // Clear all selections
  const handleClearAll = (e) => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger/Input Area */}
      <div
        className={`
          min-h-[42px] border border-gray-300 rounded-lg p-2 
          flex flex-wrap items-center gap-1 cursor-pointer
          bg-white transition-colors duration-200
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:border-gray-400"}
          ${isOpen ? "border-blue-500 ring-2 ring-blue-100" : ""}
        `}
        onClick={toggleDropdown}
      >
        {/* Selected value capsules */}
        {value.map((selected) => (
          <div
            key={selected.value}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
          >
            <span>{selected.label}</span>
            {isMultiSelect && (
              <button
                type="button"
                onClick={(e) => handleRemove(selected.value, e)}
                className="hover:text-blue-600 transition-colors"
                disabled={disabled}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        {/* Search input when dropdown is open */}
        {isOpen && isMultiSelect ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
            placeholder="Search..."
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          /* Placeholder when no selections */
          value.length === 0 && (
            <span className="text-gray-500 text-sm flex-1">
              {placeholder}
            </span>
          )
        )}

        {/* Selection summary when closed and has selections */}
        {!isOpen && value.length > 0 && isMultiSelect && (
          <span className="text-gray-500 text-sm flex-1">
            {value.length} selected
          </span>
        )}

        {/* Control buttons */}
        <div className="flex items-center gap-1 ml-auto">
          {isClearable && value.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              disabled={disabled}
            >
              <X size={16} />
            </button>
          )}
          <div className="text-gray-400">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Select All / Deselect All options - Only show when multi-select is enabled */}
          {isMultiSelect && showSelectAll && options.length > 0 && (
            <>
              <div
                className={`
                  px-3 py-2 text-sm cursor-pointer transition-colors duration-200 border-b border-gray-200
                  ${allSelected ? "bg-blue-50 text-blue-800" : "hover:bg-gray-50"}
                  ${disabled ? "cursor-not-allowed opacity-60" : ""}
                `}
                onClick={handleToggleSelectAll}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {allSelected ? "Deselect All" : "Select All"}
                  </span>
                  <div className="flex items-center">
                    {someSelected && !allSelected && (
                      <div className="w-4 h-4 border-2 border-blue-600 bg-white rounded mr-2" />
                    )}
                    {allSelected && (
                      <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick action buttons */}
              <div className="flex border-b border-gray-200">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex-1 px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                  disabled={disabled || allSelected}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="flex-1 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  disabled={disabled || value.length === 0}
                >
                  Clear All
                </button>
              </div>
            </>
          )}

          {/* Options list */}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = value.some(val => val.value === option.value);
              
              return (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 text-sm cursor-pointer transition-colors duration-200
                    ${isSelected 
                      ? "bg-blue-50 text-blue-800" 
                      : "hover:bg-gray-50"
                    }
                    ${disabled ? "cursor-not-allowed opacity-60" : ""}
                  `}
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;