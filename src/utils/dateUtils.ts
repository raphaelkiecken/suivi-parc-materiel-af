import type { MaintenanceRecord } from '../types/equipment';

export function formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

export function findLastMaintenanceDate(equipmentId: number, maintenanceList: MaintenanceRecord[]): string {
    const recordsForEquipment = maintenanceList.filter(record => record.equipmentId === equipmentId);
    if (recordsForEquipment.length === 0) {
        return '';
    }
    const lastRecord = recordsForEquipment.reduce((latest, record) => {
        return new Date(record.date) > new Date(latest.date) ? record : latest;
    }, recordsForEquipment[0]);
    return lastRecord.date;
}
