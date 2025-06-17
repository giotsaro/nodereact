// src/components/FilterPanel.jsx
import React from "react";

const FilterPanel = ({ role }) => {
  return (
    <div className="bg-gray-400 dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <input
          type="text"
          placeholder="search"
          className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          placeholder="sort by zip"
          className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          placeholder="radius"
          className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        
        {(role === "admin" || role === "sa") && (
          <select className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
            <option value="all">all</option>
            <option value="group1">group1</option>
            <option value="group2">group2</option>
            <option value="group3">group3</option>
          </select>
        )}

        <div className="flex items-center space-x-2 col-span-full sm:col-span-2">
          <label htmlFor="checkbox">Hide unavailable  </label>
          <input
            id="checkbox"
            type="checkbox"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
