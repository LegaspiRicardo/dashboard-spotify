import type { ApiConfig, SpotifySearchResponse, Track } from '../types/spotify';

/**
 * Cliente para la API de Spotify con manejo robusto de errores y caché
 */
class SpotifyAPI {
  private accessToken: string | null = null;
  private tokenExpiration: number | null = null;
  private config: ApiConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private retryAttempts = 3;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Obtiene token de acceso con reintentos y validación mejorada
   */
  private async getAccessToken(): Promise<string> {
    // Verificar si el token actual es válido
    if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.accessToken;
    }

    // Validar credenciales - CORREGIDO: manejo seguro de strings
    const clientId = this.config.clientId;
    const clientSecret = this.config.clientSecret;
    
    if (!clientId?.trim() || !clientSecret?.trim()) {
      throw new Error(
        'Credenciales de Spotify faltantes. ' +
        'Verifica que VITE_SPOTIFY_CLIENT_ID y VITE_SPOTIFY_CLIENT_SECRET estén en tu .env'
      );
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          },
          body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          if (response.status === 400 || response.status === 401) {
            throw new Error(`Credenciales inválidas: ${errorText}`);
          }
          
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data.access_token) {
          throw new Error('No se recibió token de acceso de Spotify');
        }

        // Guardar token con margen de seguridad
        this.accessToken = data.access_token;
        this.tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000; // 1 minuto antes

        console.log(' Token de Spotify obtenido exitosamente');


      } catch (error) {
        console.error(` Intento ${attempt} de autenticación falló:`, error);
        
        if (attempt === this.retryAttempts) {
          this.accessToken = null;
          this.tokenExpiration = null;
          throw new Error(
            `Fallo de autenticación después de ${this.retryAttempts} intentos: ${error instanceof Error ? error.message : 'Error desconocido'}`
          );
        }
        
        // Esperar antes de reintentar (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw new Error('No se pudo obtener token de acceso');
  }

  /**
   * Método base para todas las peticiones 
   */
  private async makeRequest<T>(
    endpoint: string, 
    params: Record<string, string> = {}, 
    options: { retryOnAuthError?: boolean } = {}
  ): Promise<T> {
    const { retryOnAuthError = true } = options;
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.config.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    // Clave única para la petición
    const requestKey = `${endpoint}?${queryString}`;

    // Si ya hay una petición idéntica en curso,la reutiliza
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)!;
    }

    const requestPromise = (async () => {
      for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
        try {
          const token = await this.getAccessToken();
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json() as T;
            return data;
          }

          // Manejo específico de errores HTTP
          if (response.status === 401 && retryOnAuthError) {
            console.log(' Token expirado, renovando...');
            this.accessToken = null;
            this.tokenExpiration = null;
            continue; // Reintentar con nuevo token
          }

          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * attempt;
            console.log(` Rate limit, esperando ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }

          // Errores del cliente (4xx) no se reintentan
          if (response.status >= 400 && response.status < 500) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `Error ${response.status}: ${errorData.error?.message || response.statusText}`
            );
          }

          // Errores del servidor (5xx) se reintentan
          if (response.status >= 500) {
            throw new Error(`Error del servidor Spotify: ${response.status}`);
          }

        } catch (error) {
          console.error(` Intento ${attempt} falló para ${endpoint}:`, error);
          
          if (attempt === this.retryAttempts) {
            throw error;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      
      throw new Error(`Todos los intentos fallaron para: ${endpoint}`);
    })();

    // Guardar en cola y limpiar cuando termine
    this.requestQueue.set(requestKey, requestPromise);
    requestPromise.finally(() => {
      this.requestQueue.delete(requestKey);
    });

    return requestPromise;
  }

  /**
 * Obtiene tracks por género (alias para getTracksByGenreAndMarket)
 */
async getTracksByGenre(
  genre: string, 
  market: string = 'US', 
  limit: number = 50
): Promise<Track[]> {
  return this.getTracksByGenreAndMarket(genre, market, limit);
}

  /**
   * Busca tracks por género y mercado 
   */
  async getTracksByGenreAndMarket(
    genre: string, 
    market: string = 'US', 
    limit: number = 50
  ): Promise<Track[]> {
    try {
      console.log(` Buscando tracks de "${genre}" en ${market}`);

      // Términos de búsqueda  por género
      const searchTerms: Record<string, string> = {
        techno: 'techno melodicTechno',
        psytrance: 'psytrance psytrance',
        trance: 'trance',
        house: 'house',
        progressive: 'progressive house'
      };

      const searchQuery = searchTerms[genre.toLowerCase()] || genre;
      
      const response = await this.makeRequest<SpotifySearchResponse>('/search', {
        q: searchQuery,
        type: 'track',
        limit: Math.min(limit, 50).toString(), // Spotify max: 50
        market: market
      });

      const tracks = response.tracks.items;
      
      console.log(` Encontrados ${tracks.length} tracks de ${genre} en ${market}`);
      
      // Log de sample para debugging
      if (tracks.length > 0) {
        console.log(`📊 Sample:`, tracks.slice(0, 3).map(t => ({
          name: t.name,
          artists: t.artists.map(a => a.name).join(', '),
          popularity: t.popularity
        })));
      }

      return tracks;

    } catch (error) {
      console.error(` Error buscando ${genre} en ${market}:`, error);
      throw new Error(
        `No se pudieron obtener tracks de ${genre} para ${market}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Búsqueda genérica de tracks con filtros
   */
  async searchTracks(
    query: string, 
    market: string = 'US', 
    limit: number = 50
  ): Promise<Track[]> {
    const response = await this.makeRequest<SpotifySearchResponse>('/search', {
      q: query,
      type: 'track',
      limit: limit.toString(),
      market: market
    });

    return response.tracks.items;
  }

  /**
   * Busca playlists por término de búsqueda
   */
  async searchPlaylists(
    query: string, 
    limit: number = 20,
    offset: number = 0
  ): Promise<any> {
    try {
      const response = await this.makeRequest<any>('/search', {
        q: query,
        type: 'playlist',
        limit: limit.toString(),
        offset: offset.toString()
      });

      return response;
    } catch (error) {
      console.error(` Error searching playlists for "${query}":`, error);
      throw new Error(
        `No se pudieron buscar playlists: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  }

  /**
   * Obtiene información detallada de un track específico
   */
  async getTrackDetails(trackId: string): Promise<Track> {
    return this.makeRequest<Track>(`/tracks/${trackId}`);
  }

  /**
   * Obtiene tracks de una playlist
   */
  async getPlaylistTracks(playlistId: string, limit: number = 20): Promise<Track[]> {
    try {
      const response = await this.makeRequest<any>(`/playlists/${playlistId}/tracks`, {
        limit: limit.toString(),
        fields: 'items(track(id,name,artists,album,popularity,duration_ms,preview_url,external_urls))',
        market: 'US'
      });

      return response.items
        .map((item: any) => item.track)
        .filter((track: any) => track !== null);

    } catch (error) {
      console.error(`Error obteniendo tracks de playlist ${playlistId}:`, error);
      throw error;
    }
  }

  /**
   * Limpia el cache de autenticación (útil para testing)
   */
  clearAuthCache(): void {
    this.accessToken = null;
    this.tokenExpiration = null;
    this.requestQueue.clear();
    console.log(' Cache de autenticación limpiado');
  }
}

// Configuración e inicialización 
const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  return value ? value.trim() : '';
};

const clientId = getEnvVar('VITE_SPOTIFY_CLIENT_ID');
const clientSecret = getEnvVar('VITE_SPOTIFY_CLIENT_SECRET');

// Si faltan credenciales, usar valores vacíos pero válidos
const finalClientId = clientId || '';
const finalClientSecret = clientSecret || '';

// Validación temprana de credenciales (solo warning, no error)
if (!clientId || !clientSecret) {
  console.warn(
    'Hacen falta las Credenciales de Spotifys!\n' +
    'Por favor agrega al archivo .env:\n' +
    'VITE_SPOTIFY_CLIENT_ID=tu_client_id\n' + 
    'VITE_SPOTIFY_CLIENT_SECRET=tu_client_secret\n' 
  );
}

export const spotifyAPI = new SpotifyAPI({
  clientId: finalClientId,
  clientSecret: finalClientSecret,
  baseUrl: 'https://api.spotify.com/v1',
});