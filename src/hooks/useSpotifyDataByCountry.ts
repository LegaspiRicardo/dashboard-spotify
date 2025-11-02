import { useState, useEffect } from 'react';
import type { Track } from '../types/spotify';
import { spotifyAPI } from '../services/spotifyApi';

export const COUNTRIES = {
  GLOBAL: { code: 'US', name: 'Global', flag: '' },
  BR: { code: 'BR', name: 'Brasil', flag: '' },
  DE: { code: 'DE', name: 'Alemania', flag: '' },
  MX: { code: 'MX', name: 'México', flag: '' }
} as const;

export type CountryCode = keyof typeof COUNTRIES;

interface UseSpotifyDataByCountryReturn {
  technoTracks: Track[];
  psytranceTracks: Track[];
  loading: boolean;
  error: string | null;
  selectedCountry: CountryCode;
  setSelectedCountry: (country: CountryCode) => void;
}

export const useSpotifyDataByCountry = (): UseSpotifyDataByCountryReturn => {
  const [technoTracks, setTechnoTracks] = useState<Track[]>([]);
  const [psytranceTracks, setPsytranceTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('GLOBAL');

  const fetchDataForCountry = async (country: CountryCode) => {
    try {
      setLoading(true);
      setError(null);

      const market = COUNTRIES[country].code;

      console.log(`🎯 Starting data fetch for: ${COUNTRIES[country].name} (${market})`);

      const [technoData, psytranceData] = await Promise.all([
        spotifyAPI.getTracksByGenreAndMarket('techno', market, 40),
        spotifyAPI.getTracksByGenreAndMarket('psytrance', market, 40)
      ]);

      console.log(`✅ SUCCESS - Data loaded for ${COUNTRIES[country].name}:`, {
        technoTracks: technoData.length,
        psytranceTracks: psytranceData.length,
        sampleTechno: technoData.slice(0, 2).map(t => t.name),
        sampleTrance: psytranceData.slice(0, 2).map(t => t.name)
      });

      setTechnoTracks(technoData);
      setPsytranceTracks(psytranceData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data from Spotify';
      setError(errorMessage);
      console.error(`❌ ERROR fetching data for ${country}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataForCountry(selectedCountry);
  }, [selectedCountry]);

  return {
    technoTracks,
    psytranceTracks,
    loading,
    error,
    selectedCountry,
    setSelectedCountry
  };
};