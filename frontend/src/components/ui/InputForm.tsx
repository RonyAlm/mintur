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
      <Label className="">
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
              className=""
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