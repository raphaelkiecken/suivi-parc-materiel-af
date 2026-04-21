import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import type { MaintenanceRecord, MaintenanceFormData } from '../types/equipment';
import { createMaintenance, fetchMaintenanceList, updateMaintenance } from '../services/maintenanceApi';

const emptyMaintenanceFormData: MaintenanceFormData = {
    date: '',
    interventionType: 'Préventive',
    interventionStatus: 'Planifiée',
    description: '',
    performedBy: '',
    downtimeMinutes: 0,
    notes: '',
    cost: 0
};

export function useMaintenance() {
    const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>([]);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
    const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
    const [isReadOnlyMaintenanceModal, setIsReadOnlyMaintenanceModal] = useState(false);
    const [editingMaintenanceId, setEditingMaintenanceId] = useState<number | null>(null);
    const [maintenanceFormData, setMaintenanceFormData] = useState<MaintenanceFormData>(emptyMaintenanceFormData);
    const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true);
    const [maintenanceError, setMaintenanceError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function loadMaintenances() {
            setIsLoadingMaintenance(true);
            setMaintenanceError(null);

            try {
                const records = await fetchMaintenanceList();
                if (!isCancelled) {
                    setMaintenanceList(records);
                }
            } catch {
                if (!isCancelled) {
                    setMaintenanceError('Impossible de charger les maintenances depuis le serveur.');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingMaintenance(false);
                }
            }
        }

        void loadMaintenances();

        return () => {
            isCancelled = true;
        };
    }, []);

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
        setIsReadOnlyMaintenanceModal(false);
        setMaintenanceFormData(emptyMaintenanceFormData);
        setIsMaintenanceFormOpen(true);
    }

    function openEditMaintenanceForm(record: MaintenanceRecord) {
        setSelectedEquipmentId(record.equipmentId);
        setEditingMaintenanceId(record.id);
        setIsReadOnlyMaintenanceModal(false);
        setMaintenanceFormData({
            date: record.date,
            interventionType: record.interventionType,
            interventionStatus: record.interventionStatus,
            description: record.description,
            performedBy: record.performedBy,
            downtimeMinutes: record.downtimeMinutes,
            notes: record.notes,
            cost: record.cost
        });
        setIsMaintenanceFormOpen(true);
    }

    function openReadOnlyMaintenanceForm(record: MaintenanceRecord) {
        setSelectedEquipmentId(record.equipmentId);
        setEditingMaintenanceId(record.id);
        setIsReadOnlyMaintenanceModal(true);
        setMaintenanceFormData({
            date: record.date,
            interventionType: record.interventionType,
            interventionStatus: record.interventionStatus,
            description: record.description,
            performedBy: record.performedBy,
            downtimeMinutes: record.downtimeMinutes,
            notes: record.notes,
            cost: record.cost
        });
        setIsMaintenanceFormOpen(true);
    }

    function enableMaintenanceEditMode() {
        setIsReadOnlyMaintenanceModal(false);
    }

    function handleMaintenanceFieldChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = event.target;
        const numericFields = ['cost', 'downtimeMinutes'];
        const finalValue = numericFields.includes(name) ? Number.parseFloat(value) || 0 : value;
        setMaintenanceFormData((currentData) => ({
            ...currentData,
            [name]: finalValue
        }));
    }

    async function handleMaintenanceSubmit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isReadOnlyMaintenanceModal) {
            return;
        }

        if (isEditingMaintenance && editingMaintenanceId !== null) {
            const updated = await updateMaintenance(editingMaintenanceId, maintenanceFormData);
            setMaintenanceList((currentList) =>
                currentList.map((item) => (item.id === updated.id ? updated : item))
            );
        } else if (selectedEquipmentId) {
            const created = await createMaintenance({ equipmentId: selectedEquipmentId, ...maintenanceFormData });
            setMaintenanceList((currentList) => [...currentList, created]);
        }

        setIsMaintenanceFormOpen(false);
        setEditingMaintenanceId(null);
    }

    function closeFormOnly() {
        setIsMaintenanceFormOpen(false);
        setEditingMaintenanceId(null);
        setIsReadOnlyMaintenanceModal(false);
    }

    return {
        maintenanceList,
        isMaintenanceModalOpen,
        selectedEquipmentId,
        setSelectedEquipmentId,
        isMaintenanceFormOpen,
        isReadOnlyMaintenanceModal,
        editingMaintenanceId,
        maintenanceFormData,
        isEditingMaintenance,
        isLoadingMaintenance,
        maintenanceError,
        openMaintenanceModal,
        closeMaintenanceModal,
        openAddMaintenanceForm,
        openEditMaintenanceForm,
        openReadOnlyMaintenanceForm,
        enableMaintenanceEditMode,
        handleMaintenanceFieldChange,
        handleMaintenanceSubmit,
        closeFormOnly
    };
}

export type UseMaintenanceReturn = ReturnType<typeof useMaintenance>;
