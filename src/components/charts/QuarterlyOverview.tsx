import React, { useState } from "react";
import type { GenreQuarterlyStats } from "../../types/spotify";
import QuarterlyChart from "./QuarterlyChart";
import Card from "../ui/Card";
import Toggle from "../ui/Toggle";

interface QuarterlyOverviewProps {
  quarterlyData: GenreQuarterlyStats[];
}

// Definir tipo para el estado de géneros visibles
type VisibleGenres = {
  1: "TECHNO" | "TRANCE";
  2: "TECHNO" | "TRANCE";
  3: "TECHNO" | "TRANCE";
  4: "TECHNO" | "TRANCE";
};

// Función para obtener el rango de meses por trimestre
const getMonthRange = (quarter: number): string => {
  const monthRanges: { [key: number]: string } = {
    1: "Enero - Marzo",
    2: "Abril - Junio",
    3: "Julio - Septiembre",
    4: "Octubre - Diciembre",
  };
  return monthRanges[quarter] || `Trimestre ${quarter}`;
};

const QuarterlyOverview: React.FC<QuarterlyOverviewProps> = ({
  quarterlyData,
}) => {
  const [visibleGenres, setVisibleGenres] = useState<VisibleGenres>({
    1: "TECHNO",
    2: "TECHNO",
    3: "TECHNO",
    4: "TECHNO",
  });

  // Función para alternar entre géneros
  const toggleGenre = (quarter: keyof VisibleGenres) => {
    setVisibleGenres((prev) => ({
      ...prev,
      [quarter]: prev[quarter] === "TECHNO" ? "TRANCE" : "TECHNO",
    }));
  };

  if (quarterlyData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Resumen Trimestral 2024
        </h3>
        <p className="text-gray-400">Cargando datos trimestrales...</p>
      </Card>
    );
  }

  // Reorganizar los datos por trimestre en lugar de por género
  const quartersData = ([1, 2, 3, 4] as const).map((quarter) => {
    const technoQuarter = quarterlyData
      .find((genreData) => genreData.genre === "TECHNO")
      ?.quarters.find((q) => q.quarter === quarter);

    const tranceQuarter = quarterlyData
      .find((genreData) => genreData.genre === "TRANCE")
      ?.quarters.find((q) => q.quarter === quarter);

    return {
      quarter,
      techno: technoQuarter,
      trance: tranceQuarter,
      visibleGenre: visibleGenres[quarter],
      monthRange: getMonthRange(quarter),
    };
  });

  return (
    <div className="space-y-0">
      {/* Version movil - Scroll horizontal */}
      <div className="md:hidden md:mt-16 mt-8 w-full overflow-x-hidden">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide space-x-4 px-4 pb-6 w-full max-w-full">
          {quartersData.map(
            ({ quarter, techno, trance, visibleGenre, monthRange }) => {
              const currentData = visibleGenre === "TECHNO" ? techno : trance;

              if (!currentData) return null;

              return (
                <div
                  key={`quarter-${quarter}`}
                  className="flex-shrink-0 w-[85vw] max-w-[85vw] snap-start space-y-3 p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                >
                  {/* Header del trimestre */}
                  <div className="text-center">
                    <p className="text-white text-xl font-bold">{monthRange}</p>
                    <p className="text-gray-400 text-sm">
                      {" "}
                      {currentData.totalPlays.toLocaleString()} reproducciones
                    </p>
                  </div>

                  {/* Gráfica */}
                  <div className="w-full">
                    <QuarterlyChart data={currentData} compact={true} />
                  </div>

                  {/* Toggle para cambiar género */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center mx-auto max-w-xs">
                      <span
                        className={`text-sm font-medium ${
                          visibleGenre === "TECHNO"
                            ? "text-spotify-green"
                            : "text-gray-400"
                        }`}
                      >
                        TECHNO
                      </span>

                      <Toggle
                        isOn={visibleGenre === "TRANCE"}
                        onToggle={() => toggleGenre(quarter)}
                        onLabel=""
                        offLabel=""
                      />

                      <span
                        className={`text-sm font-medium ${
                          visibleGenre === "TRANCE"
                            ? "text-purple-500"
                            : "text-gray-400"
                        }`}
                      >
                        PSYTRANCE
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Versión escritorio - Grid  */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        {quartersData.map(
          ({ quarter, techno, trance, visibleGenre, monthRange }) => {
            const currentData = visibleGenre === "TECHNO" ? techno : trance;

            if (!currentData) return null;

            return (
              <div
                key={`quarter-${quarter}`}
                className="space-y-0 w-11/12 mx-auto rounded-xl md:py-8 bg-slate-900"
              >
                {/* Header del trimestre */}
                <div className="text-center">
                  <p className="font-semibold">{monthRange}</p>
                  <p className="text-gray-400 text-sm">
                    {" "}
                    {currentData.totalPlays.toLocaleString()} reproducciones
                  </p>
                </div>

                {/* Gráfica */}
                <QuarterlyChart data={currentData} compact={true} />

                {/* Toggle para cambiar género */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center mx-auto max-w-xs">
                    <span
                      className={`text-sm font-medium ${
                        visibleGenre === "TECHNO"
                          ? "text-spotify-green"
                          : "text-gray-400"
                      }`}
                    >
                      TECHNO
                    </span>

                    <Toggle
                      isOn={visibleGenre === "TRANCE"}
                      onToggle={() => toggleGenre(quarter)}
                      onLabel=""
                      offLabel=""
                    />

                    <span
                      className={`text-sm font-medium ${
                        visibleGenre === "TRANCE"
                          ? "text-purple-500"
                          : "text-gray-400"
                      }`}
                    >
                      PSYTRANCE
                    </span>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default QuarterlyOverview;
