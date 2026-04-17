import { useMemo, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import type { EquipmentItem, EquipmentFormData } from '../types/equipment';
import { initialEquipmentData, emptyEquipmentFormData } from '../data/initialData';

export type SortField = 'purchaseDate' | 'warrantyExpiration';
export type SortDirection = 'asc' | 'desc';

export function useEquipment() {
    const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(initialEquipmentData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReadOnlyModal, setIsReadOnlyModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<EquipmentFormData>(emptyEquipmentFormData);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortField, setSortField] = useState<SortField>('purchaseDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const isEditing = editingId !== null;
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

    function openAddModal() {
        setEditingId(null);
        setIsReadOnlyModal(false);
        setFormData(emptyEquipmentFormData);
        setIsModalOpen(true);
    }

    function openEditModal(item: EquipmentItem) {
        setEditingId(item.id);
        setIsReadOnlyModal(false);
        setFormData({
            name: item.name,
            brand: item.brand,
            model: item.model,
            serialNumber: item.serialNumber,
            purchaseDate: item.purchaseDate,
            warrantyExpiration: item.warrantyExpiration,
            status: item.status,
            position: item.position
        });
        setIsModalOpen(true);
    }

    function openReadOnlyModal(item: EquipmentItem) {
        setEditingId(item.id);
        setIsReadOnlyModal(true);
        setFormData({
            name: item.name,
            brand: item.brand,
            model: item.model,
            serialNumber: item.serialNumber,
            purchaseDate: item.purchaseDate,
            warrantyExpiration: item.warrantyExpiration,
            status: item.status,
            position: item.position
        });
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setIsReadOnlyModal(false);
    }

    function handleFieldChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData((currentData) => ({
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

    function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isReadOnlyModal) {
            closeModal();
            return;
        }

        if (isEditing) {
            setEquipmentList((currentList) =>
                currentList.map((item) =>
                    item.id === editingId
                        ? { id: item.id, ...formData }
                        : item
                )
            );
        } else {
            const nextId = equipmentList.length > 0
                ? Math.max(...equipmentList.map((item) => item.id)) + 1
                : 1;

            setEquipmentList((currentList) => [
                ...currentList,
                { id: nextId, ...formData }
            ]);
        }

        closeModal();
    }

    return {
        equipmentList,
        displayedEquipmentList,
        availableLocations,
        isModalOpen,
        isReadOnlyModal,
        editingId,
        formData,
        isEditing,
        searchQuery,
        locationFilter,
        sortField,
        sortDirection,
        openAddModal,
        openEditModal,
        openReadOnlyModal,
        closeModal,
        handleFieldChange,
        handleSubmit,
        setSearchQuery,
        setLocationFilter,
        setSortField,
        setSortDirection,
        resetFilters
    };
}

export type UseEquipmentReturn = ReturnType<typeof useEquipment>;
