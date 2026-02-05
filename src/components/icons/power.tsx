import React from 'react';

interface PowerProps {
  className?: string;
  size?: number;
}

export const Power: React.FC<PowerProps> = ({ className, size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18.36 6.64C19.6184 7.89879 20.4753 9.50244 20.8223 11.2482C21.1693 12.9939 20.9909 14.8034 20.3096 16.4478C19.6284 18.0921 18.4748 19.4976 16.9948 20.4864C15.5148 21.4752 13.7749 22.0029 12 22.0029C10.2251 22.0029 8.48518 21.4752 7.00519 20.4864C5.52519 19.4976 4.37157 18.0921 3.69033 16.4478C3.00909 14.8034 2.83069 12.9939 3.17772 11.2482C3.52474 9.50244 4.38159 7.89879 5.64 6.64"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2V12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
