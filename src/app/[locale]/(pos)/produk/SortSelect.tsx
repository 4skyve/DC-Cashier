"use client";

export default function SortSelect({
  defaultValue,
  options,
}: {
  defaultValue: string;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <select
      name="sort"
      defaultValue={defaultValue}
      className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-primary-500"
      onChange={(e) => {
        e.currentTarget.form?.submit();
      }}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}