import React from "react";

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
  onLabel?: string;
  offLabel?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  isOn,
  onToggle,
  onLabel = "ON",
  offLabel = "OFF",
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span
        className={`text-sm font-medium ${
          !isOn ? "text-white" : "text-gray-400"
        }`}
      >
        {offLabel}
      </span>

      <div className="relative inline-block group">
        <button
          type="button"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-900 ${
            isOn ? "bg-purple-500" : "bg-spotify-green"
          }`}
          onClick={onToggle}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isOn ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
          <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Haz click para cambiar de género
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
          </div>
        </div>
      </div>

      <span
        className={`text-sm font-medium ${
          isOn ? "text-white" : "text-gray-400"
        }`}
      >
        {onLabel}
      </span>
    </div>
  );
};

export default Toggle;
