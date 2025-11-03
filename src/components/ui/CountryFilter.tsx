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
  const countries = Object.entries(COUNTRIES) as [CountryCode, typeof COUNTRIES[CountryCode]][];

  return (
    <Card className="p-6">
      <div 
        role="region" 
        aria-label="Selector de país para filtrar datos musicales"
        className="flex flex-col gap-4"
      >
        <div className='hidden'>
          <h2 className="text-white font-semibold text-lg mb-1">
            Filtrar resultados por País.
          </h2>
          <p 
            id="country-filter-description" 
            className="text-gray-400 text-sm"
          >
            {loading ? 'Cargando datos...' : `País actual: ${COUNTRIES[selectedCountry].name}.`}
          </p>
        </div>

        <div
          role="radiogroup"
          aria-labelledby="country-filter-description"
          aria-describedby="country-instructions"
          className="grid grid-cols-2 md:flex md:flex-row gap-3 mx-auto w-full md:w-auto" // ← CORREGIDO
        >
          {/* Instrucciones para lectores de pantalla */}
          <div id="country-instructions" className="sr-only">
            Grupo de opciones de paises. Use las flechas izquierda y derecha para navegar 
            entre los paises: {COUNTRIES[selectedCountry].name}
          </div>
          
          {countries.map(([code, country]) => (
            <button
              key={code}
              disabled={loading}
              role="radio"
              aria-checked={selectedCountry === code}
              aria-label={`${country.name} ${selectedCountry === code ? 'seleccionado' : 'no seleccionado'}. ${country.name === 'Global' ? 'Datos generales de todos los países' : `Datos específicos de ${country.name}`}`}
              aria-describedby={`country-desc-${code}`}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all w-full md:w-auto border-2 focus:outline-none focus:ring-4 focus:ring-spotify-green focus:ring-opacity-50 ${
                selectedCountry === code 
                  ? 'bg-gray-600 text-white border-white shadow-lg transform scale-105' 
                  : 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => onCountryChange(code)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCountryChange(code);
                }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  const countriesArray = Object.keys(COUNTRIES) as CountryCode[];
                  const currentIndex = countriesArray.indexOf(selectedCountry);
                  let nextIndex = currentIndex;
                  
                  // En móvil usar flechas verticales también
                  if (window.innerWidth < 768) {
                    if (e.key === 'ArrowRight') {
                      nextIndex = (currentIndex + 1) % countriesArray.length;
                    } else if (e.key === 'ArrowLeft') {
                      nextIndex = (currentIndex - 1 + countriesArray.length) % countriesArray.length;
                    } else if (e.key === 'ArrowDown') {
                      nextIndex = (currentIndex + 2) % countriesArray.length;
                    } else if (e.key === 'ArrowUp') {
                      nextIndex = (currentIndex - 2 + countriesArray.length) % countriesArray.length;
                    }
                  } else {
                    // En desktop solo flechas izquierda/derecha
                    if (e.key === 'ArrowRight') {
                      nextIndex = (currentIndex + 1) % countriesArray.length;
                    } else if (e.key === 'ArrowLeft') {
                      nextIndex = (currentIndex - 1 + countriesArray.length) % countriesArray.length;
                    }
                  }
                  
                  onCountryChange(countriesArray[nextIndex]);
                }
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span 
                  aria-hidden="true" 
                  className="text-lg"
                  role="img"
                >
                  {country.flag}
                </span>
                <span className="whitespace-nowrap">{country.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CountryFilter;