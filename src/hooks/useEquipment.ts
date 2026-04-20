import { useMemo, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import type { EquipmentItem, EquipmentFormData } from '../types/equipment';
import { initialEquipmentData, emptyEquipmentFormData } from '../data/initialData';

export type SortField = 'purchaseDate' | 'warrantyExpiration';
export type SortDirection = 'asc' | 'desc';

export function useEquipment() {
    const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(initialEquipmentData);
    const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false);
    const [isReadOnlyEquipmentModal, setIsReadOnlyEquipmentModal] = useState(false);
    const [editingEquipmentId, setEditingEquipmentId] = useState<number | null>(null);
    const [equipmentFormData, setEquipmentFormData] = useState<EquipmentFormData>(emptyEquipmentFormData);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortField, setSortField] = useState<SortField>('purchaseDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const isEditingEquipment = editingEquipmentId !== null;
    const availableLocations = useMemo(
        () => [...new Set(equipmentList.map((item) => item.position))].sort((a, b) => a.localeCompare(b, 'fr')),
        [equipmentList]
    );

    const displayedEquipmentList = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase('fr');

        const filteredList = equipmentList.filter((item) => {
            const matchesLocation = locationFilter === '' || item.position === locationFilter;
            if (!matchesLocation) {
                return false;
            }

            if (normalizedQuery === '') {
                return true;
            }

            const searchableContent = [
                item.name,
                item.brand,
                item.model,
                item.serialNumber,
                item.status,
                item.position
            ].join(' ').toLocaleLowerCase('fr');

            return searchableContent.includes(normalizedQuery);
        });

        return [...filteredList].sort((left, right) => {
            const leftValue = left[sortField] ?? '';
            const rightValue = right[sortField] ?? '';
            const comparisonResult = leftValue.localeCompare(rightValue);
            return sortDirection === 'asc' ? comparisonResult : -comparisonResult;
        });
    }, [equipmentList, locationFilter, searchQuery, sortDirection, sortField]);

    function setEquipmentFormFromItem(item: EquipmentItem) {
        setEquipmentFormData({
            name: item.name,
            brand: item.brand,
            model: item.model,
            serialNumber: item.serialNumber,
            purchaseDate: item.purchaseDate,
            warrantyExpiration: item.warrantyExpiration,
            status: item.status,
            position: item.position
        });
    }

    function openAddEquipmentForm() {
        setEditingEquipmentId(null);
        setIsReadOnlyEquipmentModal(false);
        setEquipmentFormData(emptyEquipmentFormData);
        setIsEquipmentFormOpen(true);
    }

    function openEditEquipmentForm(item: EquipmentItem) {
        setEditingEquipmentId(item.id);
        setIsReadOnlyEquipmentModal(false);
        setEquipmentFormFromItem(item);
        setIsEquipmentFormOpen(true);
    }

    function openReadOnlyEquipmentForm(item: EquipmentItem) {
        setEditingEquipmentId(item.id);
        setIsReadOnlyEquipmentModal(true);
        setEquipmentFormFromItem(item);
        setIsEquipmentFormOpen(true);
    }

    function closeEquipmentForm() {
        setIsEquipmentFormOpen(false);
        setIsReadOnlyEquipmentModal(false);
    }

    function enableEquipmentEditMode() {
        setIsReadOnlyEquipmentModal(false);
    }

    function handleEquipmentFieldChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setEquipmentFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    }

    function resetFilters() {
        setSearchQuery('');
        setLocationFilter('');
        setSortField('purchaseDate');
        setSortDirection('desc');
    }

    function handleEquipmentSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isReadOnlyEquipmentModal) {
            closeEquipmentForm();
            return;
        }

        if (isEditingEquipment && editingEquipmentId !== null) {
            setEquipmentList((currentList) =>
                currentList.map((item) =>
                    item.id === editingEquipmentId
                        ? { id: item.id, ...equipmentFormData }
                        : item
                )
            );
        } else {
            const nextId = equipmentList.length > 0
                ? Math.max(...equipmentList.map((item) => item.id)) + 1
                : 1;

            setEquipmentList((currentList) => [
                ...currentList,
                { id: nextId, ...equipmentFormData }
            ]);
        }

        closeEquipmentForm();
    }

    return {
        equipmentList,
        displayedEquipmentList,
        availableLocations,
        isEquipmentFormOpen,
        isReadOnlyEquipmentModal,
        editingEquipmentId,
        equipmentFormData,
        isEditingEquipment,
        searchQuery,
        locationFilter,
        sortField,
        sortDirection,
        openAddEquipmentForm,
        openEditEquipmentForm,
        openReadOnlyEquipmentForm,
        enableEquipmentEditMode,
        closeEquipmentForm,
        handleEquipmentFieldChange,
        handleEquipmentSubmit,
        setSearchQuery,
        setLocationFilter,
        setSortField,
        setSortDirection,
        resetFilters
    };
}

export type UseEquipmentReturn = ReturnType<typeof useEquipment>;
