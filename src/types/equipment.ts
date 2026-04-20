export interface EquipmentItem {
    id: number;
    name: string;
    brand: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
    warrantyExpiration: string;
    status: string;
    position: string;
}

export interface MaintenanceRecord {
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
}

export type EquipmentFormData = Omit<EquipmentItem, 'id'>;
export type MaintenanceFormData = Omit<MaintenanceRecord, 'id' | 'equipmentId'>;
