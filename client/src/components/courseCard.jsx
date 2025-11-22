import React from 'react';

const CourseCard = ({ course = {} }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          {course.title || 'Untitled Course'}
        </h3>
        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold">
          {course.code || 'N/A'}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {course.description || 'No description available.'}
      </p>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700">
          <span className="font-medium">Credits:</span> {course.credit || 0}
        </span>
        <span className="text-gray-500">
          {course.resources?.length || 0} Resources
        </span>
      </div>
    </div>
  );
};

export default CourseCard;