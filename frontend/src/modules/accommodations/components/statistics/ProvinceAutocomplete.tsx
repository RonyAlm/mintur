import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
}

interface ProvinceAutocompleteProps {
  value: string
  onValueChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
  options: string[]
  loading?: boolean
}

/**
 * Selector de provincia con búsqueda, basado en el Combobox de shadcn (base-ui).
 * El valor debe elegirse de la lista (el Combobox no admite texto libre); si la
 * API de Georef falla, el formulario degrada a un Input de texto libre.
 */
export function ProvinceAutocomplete({
  value,
  onValueChange,
  ariaLabel,
  placeholder,
  options,
  loading = false,
}: ProvinceAutocompleteProps) {
  return (
    <Combobox
      items={options}
      value={value || null}
      onValueChange={(selected) => onValueChange(selected ?? "")}
      filter={(itemValue, query) => normalize(itemValue).includes(normalize(query))}
    >
      <ComboboxInput
        aria-label={ariaLabel}
        placeholder={loading ? "Cargando provincias…" : placeholder}
        className="w-full"
      />
      <ComboboxContent>
        <ComboboxEmpty>{loading ? "Cargando provincias…" : "No se encontraron provincias."}</ComboboxEmpty>
        <ComboboxList>
          {(option) => <ComboboxItem key={option} value={option}>{option}</ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
