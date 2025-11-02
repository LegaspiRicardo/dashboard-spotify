import React from 'react';
import { COUNTRIES, type CountryCode } from '../../hooks/useSpotifyDataByCountry';
import Card from './Card';

interface CountryFilterProps {
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  loading?: boolean;
}

const CountryFilter: React.FC<CountryFilterProps> = ({
  selectedCountry,
  onCountryChange,
  loading = false
}) => {
  return (
    <Card className="shadow-xl">
      <h2 className='text-center text-xl sm:text-2xl py-4 font-bold'>Selecciona un país</h2>
      <div className="pb-6">
        {/* Versión móvil  */}
        <div className="sm:hidden">
          <div className="grid grid-cols-2 gap-2 px-2">
            {(Object.entries(COUNTRIES) as [CountryCode, typeof COUNTRIES[CountryCode]][]).map(([code, country]) => (
              <button
                key={code}
                disabled={loading}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition-all border-2 flex items-center justify-center ${selectedCountry === code
                    ? 'bg-gray-700 text-white border-white shadow-md transform scale-[1.02]'
                    : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => onCountryChange(code)}
              >
                <span className="text-xs font-semibold truncate">{country.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Versión tablet/escritorio */}
        <div className="hidden sm:flex flex-wrap justify-center gap-3 px-4">
          {(Object.entries(COUNTRIES) as [CountryCode, typeof COUNTRIES[CountryCode]][]).map(([code, country]) => (
            <button
              key={code}
              disabled={loading}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all min-w-[100px] border-2 ${selectedCountry === code
                  ? 'bg-spotify-green text-white border-spotify-green shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => onCountryChange(code)}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="font-semibold">{country.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CountryFilter;