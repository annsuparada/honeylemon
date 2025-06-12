import SelectInput from "@/app/components/SelectInput";

interface DashboardFiltersProps {
    selectedStatus: string;
    selectedPageType: string;
    sortOrder: string;
    onStatusChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onSortChange: (value: string) => void;
    statusOptions: { label: string; value: string; }[];
    typeOptions: { label: string; value: string; }[];
    sortOptions: { label: string; value: string; }[];

}
export default function DashboardFilters({
    selectedStatus, selectedPageType, sortOrder,
    onStatusChange, onTypeChange, onSortChange,
    statusOptions, typeOptions, sortOptions
}: DashboardFiltersProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <SelectInput label="Status" selectedValue={selectedStatus} options={statusOptions} onChange={onStatusChange} />
            <SelectInput label="Page Type" selectedValue={selectedPageType} options={typeOptions} onChange={onTypeChange} />
            <SelectInput label="Sort by" selectedValue={sortOrder} options={sortOptions} onChange={onSortChange} />
        </div>
    );
}
