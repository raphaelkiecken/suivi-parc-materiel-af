import type { EquipmentFormData, EquipmentItem } from '../types/equipment';

export async function fetchEquipmentList(): Promise<EquipmentItem[]> {
    const response = await fetch('/api/equipment');
    if (!response.ok) {
        throw new Error('Impossible de charger les équipements');
    }

    return response.json() as Promise<EquipmentItem[]>;
}

export async function createEquipment(payload: EquipmentFormData): Promise<EquipmentItem> {
    const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Impossible de créer l\'équipement');
    }

    return response.json() as Promise<EquipmentItem>;
}

export async function updateEquipment(id: number, payload: EquipmentFormData): Promise<EquipmentItem> {
    const response = await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Impossible de mettre à jour l\'équipement');
    }

    return response.json() as Promise<EquipmentItem>;
}
