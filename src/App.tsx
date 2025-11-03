import type {ReactNode} from 'react';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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


interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}


const AnimatedSection = ({ children, delay = 0, className = "" }: AnimatedSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true,
    margin: "-50px 0px -50px 0px"
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.95 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

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
    console.log('Estado de la API:', {
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
  const psytranceStats = calculateGenreStats(psytranceTracks, 'PSYTRANCE');

  // Loading mientras trae la información del país seleccionado
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gray-900 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <LoadingSpinner />
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="ml-4 text-white"
          >
            Cargando datos de {COUNTRIES[selectedCountry]?.name}...
          </motion.span>
        </motion.div>
      </motion.div>
    );
  }

  // Error por si hace falta configurar el archivo .env ó esta fallando la red
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-900 flex items-center justify-center"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-red-500 text-xl text-center max-w-md"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl mb-4"
          >
             Error
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            {error}
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-400 mb-4"
          >
            Esto puede pasar si:
          </motion.div>
          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-400 text-left list-disc list-inside space-y-1"
          >
            <li>Las credenciales de Spotify son incorrectas</li>
            <li>Hay problemas de red</li>
            <li>El género seleccionado no tiene suficientes tracks en este país</li>
          </motion.ul>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <Layout>
      <div className="p-0 space-y-6">
        {/* Sección Hero  */}
        <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden rounded-xl">
          <div className="relative z-10 text-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.3 }}
            >
              <motion.h1 
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-6xl md:text-6xl font-bold text-white mb-4  "
              >
                TECHNO <span className="text-gray-400"><br /> vs <br /></span> PSYTRANCE
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                Análisis comparativo de reproducciones en Spotify Music
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Filtro de países */}
        <AnimatedSection delay={0.1}>
          <CountryFilter
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
            loading={loading}
          />
        </AnimatedSection>

        {/* Gráfica de países */}
        <AnimatedSection delay={0.2} className='md:pb-16'>
          <AnimatePresence mode="wait">
            {countryStats && (
              <motion.div
                key={`country-chart-${selectedCountry}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
              >
                <CountryPieChart countryData={countryStats} />
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedSection>

        {/* Gráficas trimestrales */}
        <AnimatedSection delay={0.3}>
          <div className='py-8 rounded-xl bg-gray-800'>
            <div className='w-10/12 mx-auto md:pb-8 sm:pb-0 text-center'>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-center text-2xl font-bold"
              >
                Reproducciones totales en:{' '} <span className='hidden'>.</span>
              </motion.h2>
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className='font-bold text-4xl uppercase'
              >
                {COUNTRIES[selectedCountry]?.name || 'Global'}.
              </motion.span>
            </div>
            
            <AnimatePresence mode="wait">
              {quarterlyData.length > 0 ? (
                <motion.div
                  key="quarterly-data"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6 }}
                >
                  <QuarterlyOverview quarterlyData={quarterlyData} />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-800 rounded-xl p-8 text-center"
                >
                  <h3 className="text-xl font-bold text-white mb-2">No hay datos para mostrar</h3>
                  <p className="text-gray-400">
                    No se encontraron tracks de TECHNO o PSYTRANCE para el mercado seleccionado.
                    Intenta con otro país.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className='text-sm text-center text-gray-400 md:hidden'
            >
              Desliza hacia los lados para ver más
            </motion.p>
          </div>
        </AnimatedSection>

        {/* Overview detallado de géneros */}
        <AnimatePresence>
          {(technoStats.trackCount > 0 || psytranceStats.trackCount > 0) && (
            <AnimatedSection delay={0.4}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {technoStats.trackCount > 0 && (
                  <AnimatedSection delay={0.5}>
                    <GenreOverview stats={technoStats} />
                  </AnimatedSection>
                )}
                {psytranceStats.trackCount > 0 && (
                  <AnimatedSection delay={0.6}>
                    <GenreOverview stats={psytranceStats} />
                  </AnimatedSection>
                )}
              </div>
            </AnimatedSection>
          )}
        </AnimatePresence>

        {/* Estadísticas */}
        <AnimatePresence>
          {(technoStats.trackCount > 0 || psytranceStats.trackCount > 0) && (
            <AnimatedSection delay={0.7}>
              <div className="bg-gray-800 rounded-xl p-6 mt-6">
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-bold text-white mb-4"
                >
                  Resumen del análisis
                </motion.h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-spotify-green">{technoStats.trackCount}</div>
                    <div className="text-gray-400 text-sm">Tracks TECHNO</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-center p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-purple-500">{psytranceStats.trackCount}</div>
                    <div className="text-gray-400 text-sm">Tracks PSYTRANCE</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-center p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-spotify-green">{technoStats.avgPopularity}</div>
                    <div className="text-gray-400 text-sm">Popularidad TECHNO</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-center p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="text-2xl font-bold text-purple-500">{psytranceStats.avgPopularity}</div>
                    <div className="text-gray-400 text-sm">Popularidad PSYTRANCE</div>
                  </motion.div>
                </div>
              </div>
            </AnimatedSection>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

export default App;