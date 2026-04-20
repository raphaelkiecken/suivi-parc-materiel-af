import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { EquipmentItem, MaintenanceRecord } from './types/equipment';
import { formatDate } from './utils/dateUtils';
import './styles/equipment-page.css';

interface EquipmentPublicSheetProps {
    equipmentList: EquipmentItem[];
    maintenanceList: MaintenanceRecord[];
}

export default function EquipmentPublicSheet({ equipmentList, maintenanceList }: Readonly<EquipmentPublicSheetProps>) {
    const { equipmentId } = useParams();

    const parsedEquipmentId = Number(equipmentId);

    const equipment = useMemo(() => {
        if (Number.isNaN(parsedEquipmentId)) {
            return null;
        }

        return equipmentList.find((item) => item.id === parsedEquipmentId) ?? null;
    }, [parsedEquipmentId, equipmentList]);

    const equipmentMaintenances = useMemo(() => {
        if (Number.isNaN(parsedEquipmentId)) {
            return [];
        }

        return maintenanceList
            .filter((record) => record.equipmentId === parsedEquipmentId)
            .sort((left, right) => right.date.localeCompare(left.date));
    }, [maintenanceList, parsedEquipmentId]);

    if (!equipment) {
        return (
            <main className="equipment-public-page">
                <article className="equipment-public-card">
                    <h1>Fiche équipement</h1>
                    <p>Équipement introuvable.</p>
                </article>
            </main>
        );
    }

    return (
        <main className="equipment-public-page">
            <article className="equipment-public-card">
                <h1>Fiche équipement</h1>
                <p className="equipment-public-subtitle">Consultation rapide via QR code</p>

                <dl className="equipment-public-grid">
                    <div>
                        <dt>Nom</dt>
                        <dd>{equipment.name}</dd>
                    </div>
                    <div>
                        <dt>Marque</dt>
                        <dd>{equipment.brand}</dd>
                    </div>
                    <div>
                        <dt>Modèle</dt>
                        <dd>{equipment.model}</dd>
                    </div>
                    <div>
                        <dt>Numéro de série</dt>
                        <dd>{equipment.serialNumber}</dd>
                    </div>
                    <div>
                        <dt>Date d'achat</dt>
                        <dd>{formatDate(equipment.purchaseDate)}</dd>
                    </div>
                    <div>
                        <dt>Expiration de garantie</dt>
                        <dd>{formatDate(equipment.warrantyExpiration)}</dd>
                    </div>
                    <div>
                        <dt>Statut</dt>
                        <dd>{equipment.status}</dd>
                    </div>
                    <div>
                        <dt>Position</dt>
                        <dd>{equipment.position}</dd>
                    </div>
                </dl>

                <section className="equipment-sheet-maintenance">
                    <div className="equipment-sheet-maintenance-header">
                        <h4>Historique des maintenances ({equipmentMaintenances.length})</h4>
                    </div>

                    {equipmentMaintenances.length === 0 ? (
                        <p className="equipment-sheet-maintenance-empty">Aucune maintenance enregistrée pour cet équipement.</p>
                    ) : (
                        <ul className="equipment-sheet-maintenance-list">
                            {equipmentMaintenances.map((record) => (
                                <li key={record.id}>
                                    <strong>{formatDate(record.date)}</strong> - {record.interventionType} ({record.interventionStatus}) - {record.description} - {record.downtimeMinutes} min
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </article>
        </main>
    );
}
