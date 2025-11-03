import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import type { QuarterlyData } from '../../types/spotify';
import Card from '../ui/Card';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface QuarterlyChartProps {
    data: QuarterlyData;
    compact?: boolean;
}

// Función para obtener el rango de meses por trimestre
const getMonthRange = (quarter: number): string => {
    const monthRanges: { [key: number]: string } = {
        1: 'Enero - Marzo',
        2: 'Abril - Junio',
        3: 'Julio - Septiembre',
        4: 'Octubre - Diciembre'
    };
    return monthRanges[quarter] || `Trimestre ${quarter}`;
};

const QuarterlyChart: React.FC<QuarterlyChartProps> = ({ data, compact = false }) => {
    const displayWeeks = compact
        ? data.weeks.filter((_, index) => index % 1 === 0)
        : data.weeks;

    const chartData = {
        labels: displayWeeks.map(week => `S${week.weekNumber}`),
        datasets: [
            {
                label: `Reproducciones ${data.genre} Q${data.quarter}`,
                data: displayWeeks.map(week => week.plays),
                backgroundColor: data.color,
                borderColor: data.color,
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: compact ? 0.8 : 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: !compact,
                text: `${data.genre} - Q${data.quarter} ${data.year}`,
                color: '#FFFFFF',
                font: {
                    size: 14
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `Reproducciones: ${context.parsed.y.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#9CA3AF',
                    maxTicksLimit: compact ? 8 : 8,
                    font: {
                        size: compact ? 8 : 11
                    }
                },
                grid: {
                    color: '#374151',
                    display: !compact
                },
            },
            y: {
                ticks: {
                    color: '#9CA3AF',
                    font: {
                        size: compact ? 10 : 0
                    },
                    callback: function (value: any) {
                        if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                        return value;
                    }
                },
                grid: {
                    color: '#9CA3AF',
                },
                beginAtZero: true,
            },
        },
    };

    const totalPlays = data.weeks.reduce((sum, week) => sum + week.plays, 0);
    const avgWeeklyPlays = Math.floor(totalPlays / data.weeks.length);
    const peakPlays = Math.max(...data.weeks.map(week => week.plays));
    const monthRange = getMonthRange(data.quarter);

    // Calcular métricas adicionales para mejor descripción
    const growthWeeks = data.weeks.filter(week => week.trend === 'up').length;
    const declineWeeks = data.weeks.filter(week => week.trend === 'down').length;
    const stableWeeks = data.weeks.filter(week => week.trend === 'stable').length;

    // Descripción accesible mejorada
    const chartDescription = `Gráfica de ${data.genre} . 
        Total: ${totalPlays.toLocaleString()} reproducciones. 
        Promedio semanal: ${avgWeeklyPlays.toLocaleString()}. 
        Pico máximo: ${peakPlays.toLocaleString()}. 
        Tendencia: ${growthWeeks}. semanas en crecimiento. ${declineWeeks} en descenso. ${stableWeeks} estables. 
        .`;

    return (
        <Card className={`${compact ? 'h-48' : 'h-80'} flex flex-col mb-16`}>


            {/* Contenedor principal accesible */}
            <section 
                aria-labelledby={`chart-title-${data.genre}-q${data.quarter}`}
                aria-describedby={`chart-desc-${data.genre}-q${data.quarter}`}
                className={`${compact ? 'flex-1' : 'flex-1 min-h-0'}`}
            >
                {/* Descripción detallada */}
                <div id={`chart-desc-${data.genre}-q${data.quarter}`} className="sr-only">
                    {chartDescription}
                    Esta gráfica muestra la evolución semanal de reproducciones. 
                </div>

                {/* Tabla accesible con datos detallados */}
                <div className="sr-only">
                    <table>
                        <caption>Reproducciones semanales de: {data.genre} <span className='hidden'>, en el rango de meses</span> - {monthRange} <span className='hidden'>, del año:</span> {data.year}.</caption>

                        <tbody>
                            {data.weeks.map((week) => {
                                const percentage = ((week.plays / totalPlays) * 100).toFixed(1);
                                return (
                                    <tr key={week.weekNumber}>
                                        <th scope="row">Semana {week.weekNumber}</th>
                                        <td>{week.plays.toLocaleString()} reproducciones</td>
                                        <td>
                                            <span aria-hidden="true">
                                                {week.trend === 'up' && '📈'}
                                                {week.trend === 'down' && '📉'}
                                                {week.trend === 'stable' && '➡️'}
                                            </span>
                                            <span className="sr-only">
                                                {week.trend === 'up' && ''}
                                                {week.trend === 'down' && ''}
                                                {week.trend === 'stable' && ''}
                                            </span>
                                        </td>
                                        <td>{percentage}% del total trimestral.</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th scope="row">Total del Trimestre</th>
                                <td colSpan={3}>
                                    <strong>{totalPlays.toLocaleString()} reproducciones</strong>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Gráfica visual - oculta para lectores de pantalla */}
                <div 
                    role="img"
                    aria-hidden="true"
                    className="h-full"
                >
                    <Bar
                        data={chartData}
                        options={options}
                    />
                </div>
            </section>

            {/* Resumen estadístico visible */}
            {!compact ? (
                <div
                    className="p-4 border-t border-gray-700"
                    role="complementary"
                    aria-label={`Resumen numérico del trimestre ${data.quarter}`}
                >
                    <div className="sr-only">
                        Resumen estadístico: Total {totalPlays.toLocaleString()} reproducciones, 
                        promedio {avgWeeklyPlays.toLocaleString()} por semana, 
                        pico máximo {peakPlays.toLocaleString()}.
                    </div>
                    
                    <div
                        className="grid grid-cols-3 gap-4 text-sm"
                        role="group"
                        aria-label="Métricas principales del trimestre"
                    >
                        <div className="text-center">
                            <p className="text-gray-400" id="total-label">Total Q{data.quarter}</p>
                            <p
                                className="text-white font-bold"
                                aria-labelledby="total-label"
                                aria-live="polite"
                            >
                                {totalPlays.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400" id="average-label">Promedio Semanal</p>
                            <p
                                className="text-white font-bold"
                                aria-labelledby="average-label"
                                aria-live="polite"
                            >
                                {avgWeeklyPlays.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400" id="peak-label">Pico Máximo</p>
                            <p
                                className="text-white font-bold"
                                aria-labelledby="peak-label"
                                aria-live="polite"
                            >
                                {peakPlays.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // Versión compacta con información mínima pero accesible
                <div className="p-2 border-t border-gray-700">
                    <div className="sr-only">
                        <p>Trimestre: {data.quarter}: {totalPlays.toLocaleString()} reproducciones totales.</p>
                        <p>Periodo: {monthRange}.</p>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default QuarterlyChart;