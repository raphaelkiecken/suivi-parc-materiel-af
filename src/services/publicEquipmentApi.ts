export interface PublicEquipmentSheetData {
    equipment: {
        id: number;
        name: string;
        brand: string;
        model: string;
        serialNumber: string;
        purchaseDate: string;
        warrantyExpiration: string;
        status: string;
        position: string;
    };
    maintenances: Array<{
        id: number;
        equipmentId: number;
        date: string;
        interventionType: 'Préventive' | 'Corrective';
        interventionStatus: 'Planifiée' | 'En cours' | 'Terminée';
        description: string;
        performedBy: string;
        downtimeMinutes: number;
        notes: string;
        cost: number;
    }>;
}

export async function fetchPublicEquipmentSheet(equipmentId: number): Promise<PublicEquipmentSheetData> {
    const response = await fetch(`/api/public/equipment/${equipmentId}`);

    if (!response.ok) {
        throw new Error('Impossible de charger la fiche publique');
    }

    return response.json() as Promise<PublicEquipmentSheetData>;
}
