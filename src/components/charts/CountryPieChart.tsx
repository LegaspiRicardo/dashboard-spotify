// components/CountryPieChart.tsx - VERSIÓN CORREGIDA
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { CountryPieData } from '../../types/spotify';
import Card from '../ui/Card';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CountryPieChartProps {
    countryData: CountryPieData;
}

export const CountryPieChart: React.FC<CountryPieChartProps> = ({ countryData }) => {
    const genreColors = {
        'TECHNO': '#1DB954',
        'PSYTRANCE': '#9B82F6'
    };

    const country = countryData.countries[0];

    if (!country) {
        return (
            <Card className="p-6 shadow-xl">
                <div className="text-center text-gray-400">
                    No hay datos disponibles para mostrar
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 shadow-xl  bg-gray-800">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-400">
                Preferencias en <span className='text-white text-4xl font-bold'>{country.country}</span>
            </h2>

            <div className="md:flex flex-row items-center">
                {/* Gráfica pie principal */}
                <div className="h-64 w-64 mx-auto mb-6">
                    <Pie
                        data={{
                            labels: ['Techno', 'Psytrance'],
                            datasets: [
                                {
                                    data: [country.percentage?.TECHNO || 0, country.percentage?.PSYTRANCE || 0],
                                    backgroundColor: [genreColors.TECHNO, genreColors.PSYTRANCE],
                                    borderWidth: 3,
                                    borderColor: '#1F2937'
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: { 
                                    display: false,
                                    position: 'bottom',
                                    labels: {
                                        color: '#F3F4F6',
                                        font: {
                                            size: 14
                                        }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context: any) {
                                            return `${context.label}: ${context.raw.toFixed(1)}%`;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>

                {/* Estadísticas  */}
                <div className="space-y-3 text-sm w-full mx-auto max-w-xs mb-12">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                            <div
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: genreColors.TECHNO }}
                            ></div>
                            <span className="text-gray-300 font-medium uppercase">Techno</span>
                        </div>
                        <span className="text-white font-bold text-lg">
                            {country.percentage?.TECHNO.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg ">
                        <div className="flex items-center">
                            <div
                                className="w-4 h-4 rounded-full mr-3"
                                style={{ backgroundColor: genreColors.PSYTRANCE }}
                            ></div>
                            <span className="text-gray-300 font-medium uppercase">Psytrance</span>
                        </div>
                        <span className="text-white font-bold text-lg">
                            {country.percentage?.PSYTRANCE.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};