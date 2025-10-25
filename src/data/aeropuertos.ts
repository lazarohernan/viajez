export interface Aeropuerto {
  codigo: string
  nombre: string
  ciudad: string
  pais: string
}

// Lista de aeropuertos principales con códigos IATA
export const AEROPUERTOS: Aeropuerto[] = [
  // Aeropuertos de Honduras
  {
    codigo: 'SAP',
    nombre: 'Aeropuerto Internacional Ramón Villeda Morales',
    ciudad: 'San Pedro Sula',
    pais: 'Honduras',
  },
  {
    codigo: 'TGU',
    nombre: 'Aeropuerto Internacional Toncontín',
    ciudad: 'Tegucigalpa',
    pais: 'Honduras',
  },
  {
    codigo: 'XPL',
    nombre: 'Aeropuerto Internacional Palmerola',
    ciudad: 'Palmerola',
    pais: 'Honduras',
  },
  {
    codigo: 'RTB',
    nombre: 'Aeropuerto Internacional Golosón',
    ciudad: 'Roatán',
    pais: 'Honduras',
  },
  {
    codigo: 'LCE',
    nombre: 'Aeropuerto Internacional Golosón',
    ciudad: 'La Ceiba',
    pais: 'Honduras',
  },

  // Aeropuertos principales de Centroamérica
  {
    codigo: 'GUA',
    nombre: 'Aeropuerto Internacional La Aurora',
    ciudad: 'Ciudad de Guatemala',
    pais: 'Guatemala',
  },
  {
    codigo: 'FRS',
    nombre: 'Aeropuerto Internacional Mundo Maya',
    ciudad: 'Flores',
    pais: 'Guatemala',
  },
  {
    codigo: 'SAL',
    nombre: 'Aeropuerto Internacional de El Salvador',
    ciudad: 'San Salvador',
    pais: 'El Salvador',
  },
  {
    codigo: 'MGA',
    nombre: 'Aeropuerto Internacional Augusto C. Sandino',
    ciudad: 'Managua',
    pais: 'Nicaragua',
  },
  {
    codigo: 'SJO',
    nombre: 'Aeropuerto Internacional Juan Santamaría',
    ciudad: 'San José',
    pais: 'Costa Rica',
  },
  {
    codigo: 'PTY',
    nombre: 'Aeropuerto Internacional de Tocumen',
    ciudad: 'Ciudad de Panamá',
    pais: 'Panamá',
  },

  // Aeropuertos principales de Norteamérica
  {
    codigo: 'ATL',
    nombre: 'Aeropuerto Internacional Hartsfield-Jackson',
    ciudad: 'Atlanta',
    pais: 'Estados Unidos',
  },
  {
    codigo: 'JFK',
    nombre: 'Aeropuerto Internacional John F. Kennedy',
    ciudad: 'Nueva York',
    pais: 'Estados Unidos',
  },
  {
    codigo: 'LAX',
    nombre: 'Aeropuerto Internacional de Los Ángeles',
    ciudad: 'Los Ángeles',
    pais: 'Estados Unidos',
  },
  {
    codigo: 'MIA',
    nombre: 'Aeropuerto Internacional de Miami',
    ciudad: 'Miami',
    pais: 'Estados Unidos',
  },
  {
    codigo: 'ORD',
    nombre: "Aeropuerto Internacional O'Hare",
    ciudad: 'Chicago',
    pais: 'Estados Unidos',
  },
  {
    codigo: 'YYZ',
    nombre: 'Aeropuerto Internacional Pearson de Toronto',
    ciudad: 'Toronto',
    pais: 'Canadá',
  },
  {
    codigo: 'MEX',
    nombre: 'Aeropuerto Internacional de la Ciudad de México',
    ciudad: 'Ciudad de México',
    pais: 'México',
  },

  // Aeropuertos principales de Europa
  {
    codigo: 'MAD',
    nombre: 'Aeropuerto Adolfo Suárez Madrid-Barajas',
    ciudad: 'Madrid',
    pais: 'España',
  },
  {
    codigo: 'BCN',
    nombre: 'Aeropuerto Josep Tarradellas Barcelona-El Prat',
    ciudad: 'Barcelona',
    pais: 'España',
  },
  {
    codigo: 'LHR',
    nombre: 'Aeropuerto de Londres Heathrow',
    ciudad: 'Londres',
    pais: 'Reino Unido',
  },
  {
    codigo: 'CDG',
    nombre: 'Aeropuerto de París-Charles de Gaulle',
    ciudad: 'París',
    pais: 'Francia',
  },
  {
    codigo: 'FRA',
    nombre: 'Aeropuerto de Fráncfort del Meno',
    ciudad: 'Fráncfort',
    pais: 'Alemania',
  },
  {
    codigo: 'FCO',
    nombre: 'Aeropuerto de Roma-Fiumicino',
    ciudad: 'Roma',
    pais: 'Italia',
  },
  {
    codigo: 'AMS',
    nombre: 'Aeropuerto de Ámsterdam Schiphol',
    ciudad: 'Ámsterdam',
    pais: 'Países Bajos',
  },

  // Aeropuertos principales de América Latina
  {
    codigo: 'BOG',
    nombre: 'Aeropuerto Internacional El Dorado',
    ciudad: 'Bogotá',
    pais: 'Colombia',
  },
  {
    codigo: 'LIM',
    nombre: 'Aeropuerto Internacional Jorge Chávez',
    ciudad: 'Lima',
    pais: 'Perú',
  },
  {
    codigo: 'SCL',
    nombre: 'Aeropuerto Internacional Arturo Merino Benítez',
    ciudad: 'Santiago',
    pais: 'Chile',
  },
  {
    codigo: 'EZE',
    nombre: 'Aeropuerto Internacional Ministro Pistarini',
    ciudad: 'Buenos Aires',
    pais: 'Argentina',
  },
  {
    codigo: 'GIG',
    nombre: 'Aeropuerto Internacional Tom Jobim',
    ciudad: 'Río de Janeiro',
    pais: 'Brasil',
  },
  {
    codigo: 'GRU',
    nombre: 'Aeropuerto Internacional de São Paulo-Guarulhos',
    ciudad: 'São Paulo',
    pais: 'Brasil',
  },

  // Otros aeropuertos importantes
  {
    codigo: 'NRT',
    nombre: 'Aeropuerto Internacional de Narita',
    ciudad: 'Tokio',
    pais: 'Japón',
  },
  {
    codigo: 'HND',
    nombre: 'Aeropuerto Internacional de Haneda',
    ciudad: 'Tokio',
    pais: 'Japón',
  },
  {
    codigo: 'ICN',
    nombre: 'Aeropuerto Internacional de Incheon',
    ciudad: 'Seúl',
    pais: 'Corea del Sur',
  },
  {
    codigo: 'PEK',
    nombre: 'Aeropuerto Internacional de Pekín-Capital',
    ciudad: 'Pekín',
    pais: 'China',
  },
  {
    codigo: 'PVG',
    nombre: 'Aeropuerto Internacional de Shanghái-Pudong',
    ciudad: 'Shanghái',
    pais: 'China',
  },
  {
    codigo: 'DXB',
    nombre: 'Aeropuerto Internacional de Dubái',
    ciudad: 'Dubái',
    pais: 'Emiratos Árabes Unidos',
  },
  {
    codigo: 'DOH',
    nombre: 'Aeropuerto Internacional Hamad',
    ciudad: 'Doha',
    pais: 'Catar',
  },
  {
    codigo: 'SYD',
    nombre: 'Aeropuerto Internacional Kingsford Smith',
    ciudad: 'Sídney',
    pais: 'Australia',
  },
]

// Servicio para buscar aeropuertos desde APIs externas
export const aeropuertosService = {
  // Función para buscar aeropuertos por código IATA o nombre
  async buscarAeropuertos(query: string): Promise<Aeropuerto[]> {
    try {
      // Aquí puedes integrar una API externa como Aviationstack, IATA, etc.
      // Por ahora, devolveremos los aeropuertos locales que coincidan
      const busqueda = query.toLowerCase()
      return AEROPUERTOS.filter(
        (aeropuerto) =>
          aeropuerto.nombre.toLowerCase().includes(busqueda) ||
          aeropuerto.ciudad.toLowerCase().includes(busqueda) ||
          aeropuerto.codigo.toLowerCase().includes(busqueda) ||
          aeropuerto.pais.toLowerCase().includes(busqueda),
      )
    } catch (error) {
      console.error('Error buscando aeropuertos:', error)
      return []
    }
  },

  // Función para agregar un aeropuerto personalizado a la base de datos local
  agregarAeropuertoPersonalizado(aeropuerto: Omit<Aeropuerto, 'codigo'>): Aeropuerto {
    // Generar un código único basado en la ciudad
    const codigo = aeropuerto.ciudad
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, 'X')

    const nuevoAeropuerto: Aeropuerto = {
      ...aeropuerto,
      codigo,
    }

    // En una implementación real, aquí guardarías en la base de datos
    // AEROPUERTOS.push(nuevoAeropuerto)

    return nuevoAeropuerto
  },

  // Placeholder para integración con API externa
  // Para usar una API como Aviationstack necesitarías una API key
  async buscarEnAPIExterna(query: string): Promise<Aeropuerto[]> {
    // Ejemplo de integración con Aviationstack (requiere API key)
    /*
    const API_KEY = import.meta.env.VITE_AVIATIONSTACK_API_KEY
    if (!API_KEY) {
      console.warn('API key de Aviationstack no configurada')
      return []
    }

    const response = await fetch(
      `http://api.aviationstack.com/v1/airports?access_key=${API_KEY}&search=${encodeURIComponent(query)}`
    )
    const data = await response.json()

    return data.data.map((airport: any) => ({
      codigo: airport.iata_code,
      nombre: airport.name,
      ciudad: airport.city_name,
      pais: airport.country_name,
    }))
    */

    console.log('Búsqueda en API externa no implementada aún:', query)
    return []
  },
}
