import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Input } from "./input";
import { Label } from "./label";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  placeholder: string;
  label: string;
  type?: string;
}

const InputForm = <T extends FieldValues>({
  name,
  control,
  type = "text",
  placeholder,
  label,
}: Props<T>) => {
  return (
    <div className="flex flex-col gap-2">
      <Label className=" text-green-700">
        {label}
      </Label>

      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Input
              id={name}
              {...field}
              className="text-green-950/80 border-gray-300 focus-within:border-green-700
               hover:border-green-700 
              `"
              placeholder={placeholder}
              type={type}
            />

            {fieldState.error && (
              <span className="text-red-500">
                {fieldState.error.message}
              </span>
            )}
          </>
        )}
      />
    </div>
  );
};

export default InputForm;