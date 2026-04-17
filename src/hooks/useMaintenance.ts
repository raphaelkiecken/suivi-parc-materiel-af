import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import type { MaintenanceRecord, MaintenanceFormData } from '../types/equipment';
import { initialMaintenanceData, emptyMaintenanceFormData } from '../data/initialData';

export function useMaintenance() {
    const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>(initialMaintenanceData);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
    const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
    const [editingMaintenanceId, setEditingMaintenanceId] = useState<number | null>(null);
    const [maintenanceFormData, setMaintenanceFormData] = useState<MaintenanceFormData>(emptyMaintenanceFormData);

    const isEditingMaintenance = editingMaintenanceId !== null;

    function openMaintenanceModal(equipmentId: number) {
        setSelectedEquipmentId(equipmentId);
        setIsMaintenanceModalOpen(true);
    }

    function closeMaintenanceModal() {
        setIsMaintenanceModalOpen(false);
        setSelectedEquipmentId(null);
        setIsMaintenanceFormOpen(false);
        setEditingMaintenanceId(null);
    }

    function openAddMaintenanceForm(equipmentId: number) {
        setSelectedEquipmentId(equipmentId);
        setEditingMaintenanceId(null);
        setMaintenanceFormData(emptyMaintenanceFormData);
        setIsMaintenanceFormOpen(true);
    }

    function openEditMaintenanceForm(record: MaintenanceRecord) {
        setSelectedEquipmentId(record.equipmentId);
        setEditingMaintenanceId(record.id);
        setMaintenanceFormData({
            date: record.date,
            interventionType: record.interventionType,
            interventionStatus: record.interventionStatus,
            description: record.description,
            performedBy: record.performedBy,
            downtimeHours: record.downtimeHours,
            notes: record.notes,
            cost: record.cost
        });
        setIsMaintenanceFormOpen(true);
    }

    function handleMaintenanceFieldChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = event.target;
        const numericFields = ['cost', 'downtimeHours'];
        const finalValue = numericFields.includes(name) ? Number.parseFloat(value) || 0 : value;
        setMaintenanceFormData((currentData) => ({
            ...currentData,
            [name]: finalValue
        }));
    }

    function handleMaintenanceSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isEditingMaintenance && editingMaintenanceId !== null) {
            setMaintenanceList((currentList) =>
                currentList.map((item) =>
                    item.id === editingMaintenanceId
                        ? { id: item.id, equipmentId: item.equipmentId, ...maintenanceFormData }
                        : item
                )
            );
        } else if (selectedEquipmentId) {
            const nextId = maintenanceList.length > 0
                ? Math.max(...maintenanceList.map((item) => item.id)) + 1
                : 1;

            setMaintenanceList((currentList) => [
                ...currentList,
                { id: nextId, equipmentId: selectedEquipmentId, ...maintenanceFormData }
            ]);
        }

        setIsMaintenanceFormOpen(false);
        setEditingMaintenanceId(null);
    }

    function closeFormOnly() {
        setIsMaintenanceFormOpen(false);
        setEditingMaintenanceId(null);
    }

    return {
        maintenanceList,
        isMaintenanceModalOpen,
        selectedEquipmentId,
        setSelectedEquipmentId,
        isMaintenanceFormOpen,
        editingMaintenanceId,
        maintenanceFormData,
        isEditingMaintenance,
        openMaintenanceModal,
        closeMaintenanceModal,
        openAddMaintenanceForm,
        openEditMaintenanceForm,
        handleMaintenanceFieldChange,
        handleMaintenanceSubmit,
        closeFormOnly
    };
}

export type UseMaintenanceReturn = ReturnType<typeof useMaintenance>;
