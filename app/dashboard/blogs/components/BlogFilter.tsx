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
    featuredOnly: boolean;
    pillarPagesOnly: boolean;
    trendingOnly: boolean;
    onFeaturedChange: (checked: boolean) => void;
    onPillarPagesChange: (checked: boolean) => void;
    onTrendingChange: (checked: boolean) => void;
}
export default function DashboardFilters({
    selectedStatus, selectedPageType, sortOrder,
    onStatusChange, onTypeChange, onSortChange,
    statusOptions, typeOptions, sortOptions,
    featuredOnly, pillarPagesOnly, trendingOnly,
    onFeaturedChange, onPillarPagesChange, onTrendingChange
}: DashboardFiltersProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <SelectInput 
                    label="Status" 
                    selectedValue={selectedStatus} 
                    options={statusOptions} 
                    onChange={onStatusChange}
                    compact={true}
                    labelLight={true}
                />
                <SelectInput 
                    label="Page Type" 
                    selectedValue={selectedPageType} 
                    options={typeOptions} 
                    onChange={onTypeChange}
                    compact={true}
                    labelLight={true}
                />
                <SelectInput 
                    label="Sort by" 
                    selectedValue={sortOrder} 
                    options={sortOptions} 
                    onChange={onSortChange}
                    compact={true}
                    labelLight={true}
                />
            </div>

            <div className="border-b border-base-300 pb-4 mb-4">
                <h3 className="text-sm font-semibold text-base-content mb-3">Special Filters</h3>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={featuredOnly}
                            onChange={(e) => onFeaturedChange(e.target.checked)}
                            className="checkbox checkbox-primary"
                        />
                        <span className="text-sm text-base-content">Featured Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={pillarPagesOnly}
                            onChange={(e) => onPillarPagesChange(e.target.checked)}
                            className="checkbox checkbox-primary"
                        />
                        <span className="text-sm text-base-content">Pillar Pages Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={trendingOnly}
                            onChange={(e) => onTrendingChange(e.target.checked)}
                            className="checkbox checkbox-primary"
                        />
                        <span className="text-sm text-base-content">Trending Only</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
