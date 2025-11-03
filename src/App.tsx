import { useEffect } from 'react';
import './index.css'
import Layout from './components/Layout/Layout';
import GenreOverview from './components/sections/GenreOverview';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useQuarterlyData } from './hooks/useQuarterlyData';
import QuarterlyOverview from './components/charts/QuarterlyOverview';
import CountryFilter from './components/ui/CountryFilter';
import { useSpotifyDataByCountry, COUNTRIES } from './hooks/useSpotifyDataByCountry';
import type { Track, GenreStats } from './types/spotify';
import { useCountryStats } from './hooks/useCountryStats';
import { CountryPieChart } from './components/charts/CountryPieChart';



function App() {
  const {
    technoTracks,
    psytranceTracks,
    loading,
    error,
    selectedCountry,
    setSelectedCountry
  } = useSpotifyDataByCountry();

  const quarterlyData = useQuarterlyData(technoTracks, psytranceTracks);
  const countryStats = useCountryStats(technoTracks, psytranceTracks, selectedCountry);

  // Debug en tiempo real
  useEffect(() => {
    console.log('📊 APP STATE:', {
      technoTracks: technoTracks.length,
      psytranceTracks: psytranceTracks.length,
      quarterlyData: quarterlyData.length,
      selectedCountry,
      loading,
      countryStats: countryStats ? 'loaded' : 'loading'
    });
  }, [technoTracks, psytranceTracks, quarterlyData, selectedCountry, loading, countryStats]);

  // Función para calcular estadísticas
  const calculateGenreStats = (tracks: Track[], genreName: string): GenreStats => {
    if (tracks.length === 0) {
      return {
        name: genreName,
        trackCount: 0,
        avgPopularity: 0,
        topTracks: [],
        totalArtists: 0,
      };
    }

    const uniqueArtists = new Set(tracks.flatMap(track =>
      track.artists.map(artist => artist.id)
    ));

    const avgPopularity = tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length;
    const topTracks = [...tracks].sort((a, b) => b.popularity - a.popularity).slice(0, 10);

    return {
      name: genreName,
      trackCount: tracks.length,
      avgPopularity: Number(avgPopularity.toFixed(1)),
      topTracks,
      totalArtists: uniqueArtists.size,
    };
  };

  const technoStats = calculateGenreStats(technoTracks, 'TECHNO');
  const psytranceStats = calculateGenreStats(psytranceTracks, 'PSYTRANCE'); // ← CORREGIDO: cambiado tranceStats por psytranceStats

  // Loading mientras trae la información del país seleccionado
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-4 text-white">
          Cargando datos de {COUNTRIES[selectedCountry]?.name}...
        </span>
      </div>
    );
  }

  // Error por si hace falta configurar el archivo .env ó esta fallando la red
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl text-center max-w-md">
          <div className="text-2xl mb-4">❌ Error</div>
          <div className="mb-4">{error}</div>
          <div className="text-sm text-gray-400 mb-4">
            Esto puede pasar si:
          </div>
          <ul className="text-sm text-gray-400 text-left list-disc list-inside space-y-1">
            <li>Las credenciales de Spotify son incorrectas</li>
            <li>Hay problemas de red</li>
            <li>El género seleccionado no tiene suficientes tracks en este país</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-0 space-y-6 ">
        {/* Sección Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">TECHNO vs PSYTRANCE</h1>
          <p className="text-gray-400"> Comparativa de reproducciones en Spotify Music</p>
        </div>

        {/* Filtro de países */}
        <CountryFilter
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          loading={loading}
        />

        {/* Gráfica de países */}
        <div className='md:pb-16'>
          {countryStats && (
            <CountryPieChart countryData={countryStats} />
          )}
        </div>

        {/* Gráficas trimestrales */}
        <div className=' py-8 rounded-xl bg-gray-800'>
          <div className='w-10/12 mx-auto md:pb-8 sm:pb-0 text-center'>
            <h2 className="text-gray-400 text-center text-2xl font-bold">
              Reproducciones totales en{' '}
            </h2>
            <span className='font-bold text-4xl uppercase '>
              {COUNTRIES[selectedCountry]?.name || 'Global'}
            </span>
          </div>
          {quarterlyData.length > 0 ? (
            <QuarterlyOverview quarterlyData={quarterlyData} />
          ) : (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">No hay datos para mostrar</h3>
              <p className="text-gray-400">
                No se encontraron tracks de TECHNO o PSYTRANCE para el mercado seleccionado.
                Intenta con otro país.
              </p>
            </div>
          )}
          <p className='text-sm text-center text-gray-400 md:hidden'>Desliza hacia los lados para ver más</p>
        </div>

        {/* Overview detallado de géneros  */}
        {(technoStats.trackCount > 0 || psytranceStats.trackCount > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {technoStats.trackCount > 0 && <GenreOverview stats={technoStats} />}
            {psytranceStats.trackCount > 0 && <GenreOverview stats={psytranceStats} />}
          </div>
        )}

        {/* Estadísticas  */}
        {(technoStats.trackCount > 0 || psytranceStats.trackCount > 0) && (
          <div className="bg-gray-800 rounded-xl p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-4">Resumen del análisis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-spotify-green">{technoStats.trackCount}</div>
                <div className="text-gray-400 text-sm">Tracks TECHNO</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{psytranceStats.trackCount}</div>
                <div className="text-gray-400 text-sm">Tracks PSYTRANCE</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-spotify-green">{technoStats.avgPopularity}</div>
                <div className="text-gray-400 text-sm">Popularidad TECHNO</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{psytranceStats.avgPopularity}</div>
                <div className="text-gray-400 text-sm">Popularidad PSYTRANCE</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;