import { useEffect } from "react"

const TITLE_SUFFIX = "Mintur · Plataforma de Gestión Turística"

/** Actualiza `document.title` con formato "Página · Mintur". */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${TITLE_SUFFIX}` : TITLE_SUFFIX
  }, [title])
}
