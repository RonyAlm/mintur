import axios from "axios"

export interface GeorefProvince {
  id: string
  nombre: string
}

const georefClient = axios.create({
  baseURL: "https://apis.datos.gob.ar/georef/api",
})

export const georefApi = {
  /** Devuelve las provincias argentinas (id y nombre) desde la API Georef de datos.gob.ar. */
  async listProvinces(): Promise<GeorefProvince[]> {
    const { data } = await georefClient.get<{ provincias: GeorefProvince[] }>("/provincias", {
      params: { campos: "id,nombre", max: 30 },
    })
    return data.provincias
  },
}
