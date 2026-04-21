import type { MaintenanceFormData, MaintenanceRecord } from '../types/equipment';

export interface CreateMaintenancePayload extends MaintenanceFormData {
    equipmentId: number;
}

export async function fetchMaintenanceList(): Promise<MaintenanceRecord[]> {
    const response = await fetch('/api/maintenances');
    if (!response.ok) {
        throw new Error('Impossible de charger les maintenances');
    }

    return response.json() as Promise<MaintenanceRecord[]>;
}

export async function createMaintenance(payload: CreateMaintenancePayload): Promise<MaintenanceRecord> {
    const response = await fetch('/api/maintenances', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Impossible de créer la maintenance');
    }

    return response.json() as Promise<MaintenanceRecord>;
}

export async function updateMaintenance(id: number, payload: MaintenanceFormData): Promise<MaintenanceRecord> {
    const response = await fetch(`/api/maintenances/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Impossible de mettre à jour la maintenance');
    }

    return response.json() as Promise<MaintenanceRecord>;
}
