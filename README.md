# Dashboard Spotify Ricardo Legaspi

[![Vercel](https://img.shields.io/badge/deployed_on-vercel-black?style=for-the-badge&logo=vercel)](https://dashboard-spotify-ashen.vercel.app/)
[![React](https://img.shields.io/badge/react-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

Una aplicación web interactiva que compara las preferencias musicales entre **Techno** y **Psychedelic Trance** de diferentes países y periodos de tiempo.

##  Características

###  Comparación de Géneros
- **Techno vs Psychedelic Trance** - Análisis lado a lado
- **Métricas clave**: Popularidad, reproducciones, tracks más escuchados
- **Datos en tiempo real** desde Spotify API

###  Análisis por Países
- **Brasil, Alemania, México y Global**
- **Estadísticas** por mercado musical

###  Visualizaciín Interactiva
- **Gráficas trimestrales** con reproducciones semanales
- **Tooltips informativos** en todas las visualizaciones
- **Vista móvil** con swiper para navegación táctil

###  Controles de Usuario
- **Selector de país** 
- **Toggle entre géneros** 
- **Diseño 100% responsivo** 

##  Demo en Vivo

🔗 **[Ver aplicación](https://dashboard-spotify-ashen.vercel.app/)**

##  Repositorio

🔗 **[Código fuente en GitHub](https://github.com/LegaspiRicardo/dashboard-spotify)**

##  Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Gráficas**: ChartJs
- **Carrusel Móvil**: Swiper.js
- **API**: Spotify Web API
- **Deployment**: Vercel
- **Build Tool**: Vite

## Pasos Para Instalación Local

### Prerrequisitos IMPORTANTES
- Node.js 16+ 
- Cuenta de [Spotify Developer](https://developer.spotify.com/)

### Pasos de Instalación

1. **Clonar el repositorio**
git clone https://github.com/LegaspiRicardo/dashboard-spotify.git
cd dashboard-spotify

2. **Instalar dependencias**
npm install

3. **Configurar variables de entorno**
crear archivo .env

4. **Configurar credenciales de Spotify**
VITE_SPOTIFY_CLIENT_ID=tu_client_id_spotify
VITE_SPOTIFY_CLIENT_SECRET=tu_client_secret_spotify

5. **Ejecutar en desarrollo**
npm run dev

6. **Abrir en navegador**
http://localhost:5173


##  Uso de la aplicación
1.  Selección de País.
    Elige entre Brasil, Alemania, México o Global
    La información se actualiza automáticamente.

2.  Vista de Resultados
    Métricas principales de ambos generos
    Top tracks actuales por popularidad
    Comparación visual

3.  Analisis Trimestral
    Navega entre los trimestres del año
    Toogle para cambiar de generos en cada trimestre
    Grafica de barras con reproducciones semanales
    Tooltips con información


##  Limitaciones Conocidas
La API pública de Spotify no expone:
-  Estadísticas de reproducciones históricas reales
-  Datos de market share por género oficiales
-  Métricas de streaming históricas por región
-  Información demográfica de listeners

Consideraciones Técnicas
-  Datos trimestrales son proyecciones basadas en popularidad actual
-  Rate limiting de la API puede afectar carga en horas pico
