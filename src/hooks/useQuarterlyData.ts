import { useState, useEffect, useMemo } from 'react';
import type { GenreQuarterlyStats, Track, QuarterlyData, WeekData } from '../types/spotify';

// Definir interfaz para los colores de los generos
interface GenreColors {
    TECHNO: string;
    TRANCE: string;
}


export const useQuarterlyData = (technoTracks: Track[], tranceTracks: Track[]) => {
    const [quarterlyData, setQuarterlyData] = useState<GenreQuarterlyStats[]>([]);

    const generatedData = useMemo(() => {
        const genreData = {
            'TECHNO': technoTracks,
            'TRANCE': tranceTracks
        };
        return generateQuarterlyData(genreData);
    }, [technoTracks, tranceTracks]);

    useEffect(() => {
        setQuarterlyData(generatedData);
    }, [generatedData]);

    return quarterlyData;
};

// Generar datos trimestrales realistas basados en los tracks
const generateQuarterlyData = (genreData: { [key: string]: Track[] }): GenreQuarterlyStats[] => {
    const currentYear = new Date().getFullYear();

    // Colores fijos por género 
    const genreColors: GenreColors = {
        'TECHNO': '#1DB954', 
        'TRANCE': '#9B82F6'  
    };

    return Object.entries(genreData).map(([genre, tracks]) => {
        const quarters: QuarterlyData[] = [1, 2, 3, 4].map(quarter => {
            const weeklyData = generateWeeklyData(quarter, tracks, genre, currentYear);
            const totalPlays = weeklyData.reduce((sum, week) => sum + week.plays, 0);


            const color = genreColors[genre as keyof GenreColors] || '#6B7280';

            return {
                quarter,
                year: currentYear,
                weeks: weeklyData,
                totalPlays,
                color: color,
                genre
            };
        });

        const totalYearPlays = quarters.reduce((sum, quarter) => sum + quarter.totalPlays, 0);

        return {
            genre,
            quarters,
            totalYearPlays
        };
    });
};

// Función de random determinística basada en una semilla
const deterministicRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const generateWeeklyData = (quarter: number, tracks: Track[], genre: string, currentYear: number): WeekData[] => {
    const weeks: WeekData[] = [];
    const weeksInQuarter = 13;

    // Calcular base de reproducciones basada en popularidad y cantidad de tracks
    const avgPopularity = tracks.length > 0
        ? tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length
        : 50;

    // Factor de género (Techno suele tener más reproducciones que Trance)
    const genreFactor = genre === 'TECHNO' ? 1.2 : 1.0;

    // Base de reproducciones escalada
    const basePlays = Math.floor((avgPopularity / 100) * 15000 * genreFactor);

    // Semilla única basada en género y trimestre para hacer los datos determinísticos
    const seed = `${genre}-${quarter}-${currentYear}`.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);

    let previousPlays = basePlays;

    for (let week = 1; week <= weeksInQuarter; week++) {
        // Variación semanal determinística basada en la semilla + semana
        const variationSeed = seed + week;
        const variation = 0.75 + (deterministicRandom(variationSeed) * 0.5);
        
        let weeklyPlays = Math.floor(basePlays * variation);

        // Determinar tendencia
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (weeklyPlays > previousPlays * 1.1) trend = 'up';
        else if (weeklyPlays < previousPlays * 0.9) trend = 'down';

        previousPlays = weeklyPlays;

        weeks.push({
            weekNumber: ((quarter - 1) * 13) + week,
            plays: weeklyPlays,
            date: `${currentYear}-Q${quarter}-W${week}`,
            trend
        });
    }

    return weeks;
};