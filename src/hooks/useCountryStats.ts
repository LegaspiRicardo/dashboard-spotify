// hooks/useCountryStats.ts
import { useState, useEffect, useMemo } from 'react';
import type { CountryStats, CountryPieData, Track, CountryCode } from '../types/spotify';
import { COUNTRIES } from './useSpotifyDataByCountry';

const generateCountryData = (technoTracks: Track[], psytranceTracks: Track[], selectedCountry: CountryCode) => {
    // Usamos los datos REALES del país seleccionado
    const technoAvgPopularity = technoTracks.length > 0
        ? technoTracks.reduce((sum, track) => sum + track.popularity, 0) / technoTracks.length
        : 50;

    const psytranceAvgPopularity = psytranceTracks.length > 0
        ? psytranceTracks.reduce((sum, track) => sum + track.popularity, 0) / psytranceTracks.length
        : 50;

    // FACTORES POR PAÍS para reflejar preferencias reales
    const countryPreferences = {
        GLOBAL: { techno: 1.0, psytrance: 1.0 },
        BR: { techno: 0.6, psytrance: 1.8 },    // Brasil: MUCHO más psytrance
        DE: { techno: 1.4, psytrance: 0.7 },    // Alemania: más techno
        MX: { techno: 0.9, psytrance: 1.1 }     // México: balanceado
    };

    const preference = countryPreferences[selectedCountry];

    // Simulamos plays basados en popularidad real + preferencias del país
    const technoPlays = Math.floor((technoAvgPopularity / 100) * 100000 * preference.techno);
    const psytrancePlays = Math.floor((psytranceAvgPopularity / 100) * 80000 * preference.psytrance);

    return {
        TECHNO: technoPlays,
        PSYTRANCE: psytrancePlays
    };
};

export const useCountryStats = (technoTracks: Track[], psytranceTracks: Track[], selectedCountry: CountryCode) => {
    const [countryData, setCountryData] = useState<CountryPieData | null>(null);

    const generatedData = useMemo(() => {
        // SOLO generamos datos para el país seleccionado
        const playsData = generateCountryData(technoTracks, psytranceTracks, selectedCountry);
        const totalPlays = playsData.TECHNO + playsData.PSYTRANCE;

        const countryStats: CountryStats = {
            country: COUNTRIES[selectedCountry].name,
            countryCode: selectedCountry,
            totalPlays,
            genreBreakdown: playsData,
            percentage: {
                TECHNO: (playsData.TECHNO / totalPlays) * 100,
                PSYTRANCE: (playsData.PSYTRANCE / totalPlays) * 100
            }
        };

        return {
            countries: [countryStats],
            globalTotal: totalPlays
        };
    }, [technoTracks, psytranceTracks, selectedCountry]);

    useEffect(() => {
        setCountryData(generatedData);
    }, [generatedData]);

    return countryData;
};